import { config } from "dotenv";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { redis, supabase } from "./index.js";
import fetch from "node-fetch";

// Load environment variables and log the result
const result = config();
console.log("Dotenv config result:", result);
console.log("API Key present:", !!process.env.OPENAI_API_KEY);
console.log("API Key length:", process.env.OPENAI_API_KEY?.length);

// Initialize Gemini client with API key from environment
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Validation schemas
const preferenceSchema = z.object({
  hangoutTypes: z.array(z.string()),
  duration: z.string(),
  budget: z.string()
});

const locationSchema = z.object({
  location: z.string(),
  distance: z.string(),
  transportation: z.array(z.string())
});

const generateItinerarySchema = z.object({
  preferences: preferenceSchema,
  locationData: locationSchema
});

// Types for API response
interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  image: string;
  price: string;
  rating: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  type: string;
  directionsUrl?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: string;
  duration: string;
}

interface ItineraryResponse {
  title: string;
  description: string;
  location: string;
  activities: ItineraryActivity[];
  recommendations: Recommendation[];
}

// Function to get random image for category
function getRandomImageForCategory(category: "cafe atmosphere" | "historical landmarks" | "restaurant dining" | "city exploration" | "people enjoying outings" | string): string {
  const categoryImages = {
    "cafe atmosphere": [
      "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640"
    ],
    "historical landmarks": [
      "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640"
    ],
    "restaurant dining": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640"
    ],
    "city exploration": [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1519830105440-63603408ebe0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640"
    ],
    "people enjoying outings": [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1471560090527-d1af5e4e6eb6?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640",
      "https://images.unsplash.com/photo-1536625737227-92a1fc042e7e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640"
    ]
  } as const;

  const images = categoryImages[category as keyof typeof categoryImages] || categoryImages["cafe atmosphere"];
  return images[Math.floor(Math.random() * images.length)];
}

// Helper to get Google Places photo URL
async function getPlacePhotoUrl(name: string, address: string): Promise<string | undefined> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return undefined;
  // Search for the place
  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + ' ' + address)}&inputtype=textquery&fields=photos,place_id&key=${apiKey}`;
  console.log('[Google Places] Searching for:', name, address);
  console.log('[Google Places] URL:', searchUrl);
  const searchRes = await fetch(searchUrl);
  console.log('[Google Places] Status:', searchRes.status);
  const searchData = await searchRes.json();
  console.log('[Google Places] Result:', JSON.stringify(searchData));
  const candidate = searchData.candidates && searchData.candidates[0];
  if (candidate && candidate.photos && candidate.photos[0]) {
    const photoRef = candidate.photos[0].photo_reference;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
  }
  return undefined;
}

// Helper to get Google Maps directions link
function getDirectionsUrl(origin: string, destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}

// Helper to extract user ID from Supabase JWT
function getUserIdFromAuthHeader(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  // Supabase JWT: decode payload (base64) to get user id (sub)
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub;
  } catch {
    return null;
  }
}

export function registerRoutes(app: Express) {
  // Add session middleware
  // app.use(session({
  //   secret: process.env.SESSION_SECRET || "dev_secret",
  //   resave: false,
  //   saveUninitialized: false,
  //   cookie: { secure: false, httpOnly: true },
  // }));

  // Register endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.json({ id: data.user?.id, email: data.user?.email });
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return res.status(401).json({ message: error.message });
    }
    res.json({ session: data.session, user: data.user });
  });

  // Save itinerary for logged-in user
  app.post("/api/itineraries", async (req: Request, res: Response) => {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { title, description, location, activities, recommendations } = req.body;
    if (!title || !description || !location || !activities || !recommendations) {
      return res.status(400).json({ message: "Missing itinerary fields" });
    }
    const { error } = await supabase.from('itineraries').insert({
      user_id: userId,
      title,
      description,
      location,
      activities,
      recommendations
    });
    if (error) return res.status(500).json({ message: error.message });
    res.json({ success: true });
  });

  // Fetch all itineraries for logged-in user
  app.get("/api/itineraries", async (req: Request, res: Response) => {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json({ itineraries: data });
  });

  // Delete itinerary for logged-in user
  app.delete("/api/itineraries/:id", async (req: Request, res: Response) => {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    // Only allow deleting user's own itinerary
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ success: true });
  });

  // API endpoint to generate an itinerary
  app.post("/api/generate-itinerary", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { preferences, locationData } = generateItinerarySchema.parse(req.body);
      const cacheKey = `itinerary:${locationData.location}:${JSON.stringify(preferences)}`;
      // Check Redis cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      console.log("Generating itinerary for", locationData.location);
      
      // Initialize itinerary data
      let itineraryData: ItineraryResponse | null = null;
      let useOpenAI = true;
      
      // Try to use Gemini first
      try {
        console.log("Attempting to use Gemini for personalized itinerary...");
        // Improved prompt for Gemini
        const prompt = `
          You are an expert Indian travel planner. Generate a highly personalized, realistic, and diverse hangout itinerary for the following:

          Location: ${locationData.location}
          Preferences:
          - Activities: ${preferences.hangoutTypes.join(", ")}
          - Duration: ${preferences.duration}
          - Budget: ${preferences.budget}
          - Maximum travel distance: ${locationData.distance}
          - Transportation: ${locationData.transportation.join(", ")}

          Requirements:
          - The itinerary must be for authentic, real, and highly-rated venues (no made-up or generic names).
          - For each activity, include the exact venue name, full street address, and a Google Maps link.
          - Each activity must have a short justification (1-2 sentences) explaining why it fits the user's preferences.
          - Activities must be diverse and cover different types (exploring, eating, historical, cafe, etc.)
          - The response must be in strict JSON format with:
            {
              "title": string,
              "description": string,
              "location": string,
              "activities": [
                {
                  "id": string,
                  "time": string,
                  "title": string,
                  "description": string,
                  "location": string,
                  "googleMapsLink": string,
                  "justification": string,
                  "image": string,
                  "price": string,
                  "rating": string,
                  "timeOfDay": "morning" | "afternoon" | "evening",
                  "type": string
                }
              ],
              "recommendations": [
                {
                  "id": string,
                  "title": string,
                  "description": string,
                  "image": string,
                  "rating": string,
                  "duration": string
                }
              ]
            }
          - Activities must be specific to the location and based on actual venues. Include exact addresses and Google Maps links.
          - Format all times appropriately. Make sure descriptions are engaging and 1-2 sentences long.
          - Focus on authentic Indian experiences.
        `;

        // Gemini API call
        const geminiResponse = await gemini.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
        });
        // Ensure response.text is a string
        let responseText = typeof geminiResponse.text === "string" ? geminiResponse.text : "{}";
        // Remove Markdown code block markers if present
        responseText = responseText.trim();
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }
        let generatedData;
        try {
          generatedData = JSON.parse(responseText);
        } catch (err) {
          console.error("Failed to parse Gemini response as JSON. Raw response:", responseText);
          throw new Error("Gemini did not return valid JSON. Please try again.");
        }
        // Add image URLs and directions to activities based on their type
        let previousLocation = generatedData.location + ' city centre';
        if (generatedData.activities && Array.isArray(generatedData.activities)) {
          for (let i = 0; i < generatedData.activities.length; i++) {
            const activity = generatedData.activities[i];
            // Try to get a real photo
            let realImage = await getPlacePhotoUrl(activity.title, activity.location);
            activity.image = realImage || activity.image || getRandomImageForCategory(activity.type || "cafe");
            // Add directions link
            activity.directionsUrl = getDirectionsUrl(previousLocation, activity.location);
            previousLocation = activity.location;
          }
        }
        // Add image URLs to recommendations
        if (generatedData.recommendations && Array.isArray(generatedData.recommendations)) {
          for (let rec of generatedData.recommendations) {
            let realImage = await getPlacePhotoUrl(rec.title, generatedData.location);
            rec.image = realImage || rec.image || getRandomImageForCategory("historical landmarks");
          }
        }
        itineraryData = generatedData;
        console.log("Successfully generated personalized itinerary using Gemini");
      } catch (apiError) {
        console.log("Gemini API error, using fallback data:", apiError);
        useOpenAI = false;
      }
      
      // If Gemini API failed or reached rate limit, use pre-configured data
      if (!useOpenAI) {
        console.log("Using pre-configured itinerary data for", locationData.location);
        
        // Create itineraries for different locations
        const itineraries: Record<string, ItineraryResponse> = {
          "Delhi": {
            title: `${preferences.duration} Adventure in Delhi`,
            description: `Enjoy a ${preferences.budget.toLowerCase()} itinerary exploring the best of Delhi with a focus on ${preferences.hangoutTypes.join(", ").toLowerCase()}.`,
            location: "Delhi",
            activities: [
              {
                id: "act1",
                time: "9:00 AM",
                title: "Morning Chai at Connaught Place",
                description: "Start your day with a traditional chai and breakfast at one of the iconic cafes in this colonial-era shopping district.",
                location: "Connaught Place, New Delhi",
                image: getRandomImageForCategory("cafe atmosphere"),
                price: "₹",
                rating: "4.6 ★",
                timeOfDay: "morning",
                type: "cafe"
              }
            ],
            recommendations: [
              {
                id: "rec1",
                title: "Historical Delhi Tour",
                description: "A full-day tour covering Red Fort, Qutub Minar, and other historical monuments in Delhi.",
                image: getRandomImageForCategory("historical landmarks"),
                rating: "4.7 ★",
                duration: "Full day"
              }
            ]
          }
        };

        let locationToUse = "Delhi";
        if (locationData.location.toLowerCase().includes("delhi")) {
          locationToUse = "Delhi";
        } else if (locationData.location.toLowerCase().includes("noida")) {
          locationToUse = "Noida";
        } else if (locationData.location.toLowerCase().includes("jaipur")) {
          locationToUse = "Jaipur";
        } else if (locationData.location.toLowerCase().includes("mussoorie")) {
          locationToUse = "Mussoorie";
        }

        itineraryData = itineraries[locationToUse];
      }

      if (!itineraryData) {
        throw new Error("No itinerary data generated");
      }

      // Save to Redis cache
      if (itineraryData) {
        await redis.set(cacheKey, JSON.stringify(itineraryData), { EX: 60 * 60 }); // 1 hour expiry
      }

      res.json(itineraryData);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary. Please try again." });
    }
  });
}