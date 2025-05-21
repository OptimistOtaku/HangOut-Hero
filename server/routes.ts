import { config } from "dotenv";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import OpenAI from "openai";

// Load environment variables and log the result
const result = config();
console.log("Dotenv config result:", result);
console.log("API Key present:", !!process.env.OPENAI_API_KEY);
console.log("API Key length:", process.env.OPENAI_API_KEY?.length);

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

export function registerRoutes(app: Express) {
  // API endpoint to generate an itinerary
  app.post("/api/generate-itinerary", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { preferences, locationData } = generateItinerarySchema.parse(req.body);
      
      console.log("Generating itinerary for", locationData.location);
      
      // Initialize itinerary data
      let itineraryData: ItineraryResponse | null = null;
      let useOpenAI = true;
      
      // Try to use OpenAI first
      try {
        console.log("Attempting to use OpenAI for personalized itinerary...");
        
        // Prepare the prompt for OpenAI
        const prompt = `
          Generate a personalized hangout itinerary for ${locationData.location}.
          
          Preferences:
          - Activities: ${preferences.hangoutTypes.join(", ")}
          - Duration: ${preferences.duration}
          - Budget: ${preferences.budget}
          - Maximum travel distance: ${locationData.distance}
          - Transportation: ${locationData.transportation.join(", ")}
          
          Please generate a complete itinerary with realistic locations, descriptions, and timeline. 
          The response should be in JSON format and include:
          1. A title and description for the itinerary
          2. The location
          3. A list of 6 activities (2 morning, 2 afternoon, 2 evening) with:
             - Unique ID
             - Time (e.g., "9:00 AM")
             - Title
             - Description
             - Location (street address and neighborhood)
             - Price category (use "₹" for budget, "₹₹" for moderate, "₹₹₹" for expensive)
             - Rating (e.g., "4.8 ★")
             - Type (one of: "exploring", "eating", "historical", "cafe")
             - Time of day category ("morning", "afternoon", or "evening")
          4. Three relevant recommended similar adventures with title, description, rating, and duration.
          
          Make activities specific to the location, realistic, and based on actual venues. Include exact addresses.
          Format all times appropriately. Make sure descriptions are engaging and 1-2 sentences long.
          Focus on authentic Indian experiences.
        `;

        // Request completion from OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner with deep knowledge of Indian locations. You create detailed, realistic itineraries based on user preferences."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        // Parse the response
        const generatedData = JSON.parse(response.choices[0].message.content || "{}");
        
        // Add image URLs to activities based on their type
        if (generatedData.activities && Array.isArray(generatedData.activities)) {
          generatedData.activities = generatedData.activities.map((activity: any) => ({
            ...activity,
            image: activity.image || getRandomImageForCategory(activity.type || "cafe")
          }));
        }
        
        // Add image URLs to recommendations
        if (generatedData.recommendations && Array.isArray(generatedData.recommendations)) {
          generatedData.recommendations = generatedData.recommendations.map((rec: any) => ({
            ...rec,
            image: rec.image || getRandomImageForCategory("historical landmarks")
          }));
        }
        
        itineraryData = generatedData;
        console.log("Successfully generated personalized itinerary using AI");
        
      } catch (apiError) {
        console.log("OpenAI API error, using fallback data:", apiError);
        useOpenAI = false;
      }
      
      // If OpenAI API failed or reached rate limit, use pre-configured data
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

      res.json(itineraryData);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary. Please try again." });
    }
  });
}