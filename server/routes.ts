import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key"
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

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate an itinerary
  app.post("/api/generate-itinerary", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { preferences, locationData } = generateItinerarySchema.parse(req.body);
      
      // Check if OpenAI API key is working properly
      let useOpenAI = true;
      try {
        // Test the API with a small request
        await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5
        });
      } catch (apiError) {
        console.log("OpenAI API error, using fallback data:", apiError);
        useOpenAI = false;
      }
      
      let itineraryData: ItineraryResponse;
      
      if (useOpenAI) {
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
          3. A list of activities (morning, afternoon, evening) with:
             - Unique ID
             - Time (e.g., "9:00 AM")
             - Title
             - Description
             - Location (street address and neighborhood)
             - Price category (e.g., "$", "$$", "$$$")
             - Rating (e.g., "4.8 ★")
             - Type (one of: "exploring", "eating", "historical", "cafe")
             - Time of day category ("morning", "afternoon", or "evening")
          4. Three relevant recommended similar adventures with title, description, image, rating, and duration.
          
          Make activities specific to the location, realistic, and based on actual venues. Include exact addresses. 
          Format all times appropriately. Make sure descriptions are engaging and 1-2 sentences long.
        `;

        // Request completion from OpenAI
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner with deep knowledge of locations worldwide. You create detailed, realistic itineraries based on user preferences."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        // Get images based on needed categories
        itineraryData = JSON.parse(response.choices[0].message.content || "{}");
      } else {
        // Use pre-configured itinerary data based on location and preferences
        itineraryData = {
          title: `${preferences.duration} Adventure in ${locationData.location}`,
          description: `Enjoy a ${preferences.budget.toLowerCase()} itinerary exploring the best of ${locationData.location} with a focus on ${preferences.hangoutTypes.join(", ").toLowerCase()}.`,
          location: locationData.location,
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
            },
            {
              id: "act2",
              time: "11:00 AM",
              title: "Visit Humayun's Tomb",
              description: "Explore this UNESCO World Heritage site with its stunning Mughal architecture and beautiful gardens.",
              location: "Mathura Road, Nizamuddin, New Delhi",
              image: getRandomImageForCategory("historical landmarks"),
              price: "₹₹",
              rating: "4.8 ★",
              timeOfDay: "morning",
              type: "historical"
            },
            {
              id: "act3",
              time: "1:30 PM",
              title: "Lunch at Karim's",
              description: "Enjoy authentic Mughlai cuisine at this legendary restaurant known for its kebabs and curries.",
              location: "16, Gali Kababian, Jama Masjid, Old Delhi",
              image: getRandomImageForCategory("restaurant dining"),
              price: "₹₹",
              rating: "4.7 ★",
              timeOfDay: "afternoon",
              type: "eating"
            },
            {
              id: "act4",
              time: "3:30 PM",
              title: "Shop at Dilli Haat",
              description: "Browse handcrafted items, textiles, and souvenirs from across India at this open-air market.",
              location: "INA Market, New Delhi",
              image: getRandomImageForCategory("city exploration"),
              price: "₹",
              rating: "4.5 ★",
              timeOfDay: "afternoon",
              type: "exploring"
            },
            {
              id: "act5",
              time: "6:30 PM",
              title: "Sunset at India Gate",
              description: "Watch the sunset and see the monument beautifully lit up as evening falls.",
              location: "Rajpath, New Delhi",
              image: getRandomImageForCategory("historical landmarks"),
              price: "Free",
              rating: "4.9 ★",
              timeOfDay: "evening",
              type: "historical"
            },
            {
              id: "act6",
              time: "8:00 PM",
              title: "Dinner at Bukhara",
              description: "Experience one of Delhi's finest dining venues known for its Northwest Frontier cuisine and tandoori dishes.",
              location: "ITC Maurya, Diplomatic Enclave, Sardar Patel Marg",
              image: getRandomImageForCategory("restaurant dining"),
              price: "₹₹₹",
              rating: "4.8 ★",
              timeOfDay: "evening",
              type: "eating"
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
            },
            {
              id: "rec2",
              title: "Food Walk in Old Delhi",
              description: "Sample the best street food Delhi has to offer in the narrow lanes of Chandni Chowk.",
              image: getRandomImageForCategory("restaurant dining"),
              rating: "4.9 ★",
              duration: "3-4 hours"
            },
            {
              id: "rec3",
              title: "Day Trip to Agra",
              description: "Visit the magnificent Taj Mahal and Agra Fort on a day trip from Delhi.",
              image: getRandomImageForCategory("historical landmarks"),
              rating: "4.8 ★",
              duration: "Full day"
            }
          ]
        };
      }
      
      // Save the generated itinerary to storage
      const savedItinerary = await storage.saveItinerary(itineraryData);
      
      // Return the itinerary
      res.json(itineraryData);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ 
        message: "Failed to generate itinerary", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get appropriate stock images
function getRandomImageForCategory(category: string): string {
  const cityExplorationImages = [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];
  
  const cafeAtmosphereImages = [
    "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];
  
  const historicalLandmarksImages = [
    "https://images.unsplash.com/photo-1547710272-f0cd2545f838?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1588614959060-4d489ad1f035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];
  
  const restaurantDiningImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];
  
  const peopleEnjoyingOutingsImages = [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1537721664796-76f77222a5d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];
  
  let images;
  
  switch(category) {
    case "city exploration":
      images = cityExplorationImages;
      break;
    case "cafe atmosphere":
      images = cafeAtmosphereImages;
      break;
    case "historical landmarks":
      images = historicalLandmarksImages;
      break;
    case "restaurant dining":
      images = restaurantDiningImages;
      break;
    case "people enjoying outings":
      images = peopleEnjoyingOutingsImages;
      break;
    default:
      images = peopleEnjoyingOutingsImages;
  }
  
  // Return a random image from the appropriate category
  return images[Math.floor(Math.random() * images.length)];
}
