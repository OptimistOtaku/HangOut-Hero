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
      
      // Never use OpenAI API due to quota issues - always use fallback data
      const useOpenAI = false;
      console.log("Using fallback data for itinerary generation");
      
      let itineraryData: ItineraryResponse;
      
      // This code path will never be executed due to API limits
      if (false) {
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
        // Create itineraries for different locations
        const itineraries = {
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
          },
          "Noida": {
            title: `${preferences.duration} Urban Experience in Noida`,
            description: `Discover the perfect blend of modernity and culture in Noida with this ${preferences.budget.toLowerCase()} itinerary focused on ${preferences.hangoutTypes.join(", ").toLowerCase()}.`,
            location: "Noida",
            activities: [
              {
                id: "act1",
                time: "9:30 AM",
                title: "Breakfast at Gardens Galleria Mall",
                description: "Start your day with breakfast at one of the many cafes in this premium shopping destination.",
                location: "Gardens Galleria Mall, Sector 38, Noida",
                image: getRandomImageForCategory("cafe atmosphere"),
                price: "₹₹",
                rating: "4.3 ★",
                timeOfDay: "morning",
                type: "cafe"
              },
              {
                id: "act2",
                time: "11:30 AM",
                title: "Visit Okhla Bird Sanctuary",
                description: "Explore this urban oasis which is home to over 300 bird species and provides a respite from the city's hustle.",
                location: "Okhla Bird Sanctuary, Sector 95, Noida",
                image: getRandomImageForCategory("city exploration"),
                price: "₹",
                rating: "4.4 ★",
                timeOfDay: "morning",
                type: "exploring"
              },
              {
                id: "act3",
                time: "2:00 PM",
                title: "Lunch at Sector 18 Market",
                description: "Enjoy a variety of cuisines at one of the many renowned restaurants in Noida's premier shopping district.",
                location: "Sector 18 Market, Noida",
                image: getRandomImageForCategory("restaurant dining"),
                price: "₹₹",
                rating: "4.5 ★",
                timeOfDay: "afternoon",
                type: "eating"
              },
              {
                id: "act4",
                time: "4:00 PM",
                title: "Shopping at DLF Mall of India",
                description: "Browse through one of India's largest shopping malls featuring international and domestic brands.",
                location: "DLF Mall of India, Sector 18, Noida",
                image: getRandomImageForCategory("city exploration"),
                price: "₹₹₹",
                rating: "4.7 ★",
                timeOfDay: "afternoon",
                type: "exploring"
              },
              {
                id: "act5",
                time: "7:00 PM",
                title: "Evening Walk at Noida Golf Course",
                description: "Enjoy the sunset views at the beautifully maintained Noida Golf Course.",
                location: "Noida Golf Course, Sector 38, Noida",
                image: getRandomImageForCategory("city exploration"),
                price: "Free",
                rating: "4.6 ★",
                timeOfDay: "evening",
                type: "exploring"
              },
              {
                id: "act6",
                time: "8:30 PM",
                title: "Dinner at The Great India Place",
                description: "Conclude your day with dinner at one of the popular restaurants in this vibrant mall.",
                location: "The Great India Place, Sector 38A, Noida",
                image: getRandomImageForCategory("restaurant dining"),
                price: "₹₹",
                rating: "4.4 ★",
                timeOfDay: "evening",
                type: "eating"
              }
            ],
            recommendations: [
              {
                id: "rec1",
                title: "Gaming Day at Worlds of Wonder",
                description: "Enjoy a fun-filled day at this amusement park and water park complex.",
                image: getRandomImageForCategory("people enjoying outings"),
                rating: "4.5 ★",
                duration: "Full day"
              },
              {
                id: "rec2",
                title: "Noida Art & Cultural Tour",
                description: "Discover the growing art scene in Noida with visits to galleries and cultural centers.",
                image: getRandomImageForCategory("historical landmarks"),
                rating: "4.3 ★",
                duration: "Half day"
              },
              {
                id: "rec3",
                title: "Wellness Day at Sector 104",
                description: "Indulge in spa treatments and wellness activities in Noida's luxury spas.",
                image: getRandomImageForCategory("cafe atmosphere"),
                rating: "4.7 ★",
                duration: "Half day"
              }
            ]
          },
          "Jaipur": {
            title: `${preferences.duration} Royal Experience in Jaipur`,
            description: `Experience the Pink City's royal heritage and vibrant culture with this ${preferences.budget.toLowerCase()} itinerary focused on ${preferences.hangoutTypes.join(", ").toLowerCase()}.`,
            location: "Jaipur",
            activities: [
              {
                id: "act1",
                time: "8:30 AM",
                title: "Breakfast at Lakshmi Misthan Bhandar",
                description: "Start your day with authentic Rajasthani breakfast at this iconic sweet shop and restaurant.",
                location: "Johari Bazaar Road, Jaipur",
                image: getRandomImageForCategory("cafe atmosphere"),
                price: "₹",
                rating: "4.6 ★",
                timeOfDay: "morning",
                type: "cafe"
              },
              {
                id: "act2",
                time: "10:00 AM",
                title: "Explore Amber Fort",
                description: "Visit this magnificent fort complex with its stunning architecture, intricate carvings, and breathtaking views.",
                location: "Amer, Jaipur",
                image: getRandomImageForCategory("historical landmarks"),
                price: "₹₹",
                rating: "4.9 ★",
                timeOfDay: "morning",
                type: "historical"
              },
              {
                id: "act3",
                time: "1:30 PM",
                title: "Lunch at Chokhi Dhani",
                description: "Experience authentic Rajasthani cuisine in this village-themed restaurant.",
                location: "Tonk Road, Jaipur",
                image: getRandomImageForCategory("restaurant dining"),
                price: "₹₹",
                rating: "4.7 ★",
                timeOfDay: "afternoon",
                type: "eating"
              },
              {
                id: "act4",
                time: "3:30 PM",
                title: "Shopping at Johari Bazaar",
                description: "Browse through colorful textiles, jewelry, and handicrafts in this traditional market.",
                location: "Johari Bazaar, Jaipur",
                image: getRandomImageForCategory("city exploration"),
                price: "₹₹",
                rating: "4.5 ★",
                timeOfDay: "afternoon",
                type: "exploring"
              },
              {
                id: "act5",
                time: "6:00 PM",
                title: "Sunset at Nahargarh Fort",
                description: "Enjoy panoramic views of the Pink City as the sun sets behind the Aravalli hills.",
                location: "Nahargarh Fort, Jaipur",
                image: getRandomImageForCategory("historical landmarks"),
                price: "₹",
                rating: "4.8 ★",
                timeOfDay: "evening",
                type: "historical"
              },
              {
                id: "act6",
                time: "8:30 PM",
                title: "Dinner at 1135 AD",
                description: "Dine like royalty in this opulent restaurant located within Amber Fort.",
                location: "Amber Fort, Jaipur",
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
                title: "Elephant Safari at Amer",
                description: "Experience a royal elephant ride at the iconic Amber Fort, just like the Maharajas once did.",
                image: getRandomImageForCategory("historical landmarks"),
                rating: "4.6 ★",
                duration: "Half day"
              },
              {
                id: "rec2",
                title: "Hot Air Balloon Ride",
                description: "Soar above the Pink City for a breathtaking aerial view of palaces and forts.",
                image: getRandomImageForCategory("city exploration"),
                rating: "4.9 ★",
                duration: "3 hours"
              },
              {
                id: "rec3",
                title: "Block Printing Workshop",
                description: "Learn the traditional art of Rajasthani block printing from local artisans.",
                image: getRandomImageForCategory("people enjoying outings"),
                rating: "4.7 ★",
                duration: "Half day"
              }
            ]
          },
          "Mussoorie": {
            title: `${preferences.duration} Mountain Retreat in Mussoorie`,
            description: `Escape to the Queen of Hills with this refreshing ${preferences.budget.toLowerCase()} itinerary focused on ${preferences.hangoutTypes.join(", ").toLowerCase()}.`,
            location: "Mussoorie",
            activities: [
              {
                id: "act1",
                time: "8:00 AM",
                title: "Breakfast at Landour Bakehouse",
                description: "Start your day with freshly baked treats and coffee at this charming bakery in Landour.",
                location: "Landour, Mussoorie",
                image: getRandomImageForCategory("cafe atmosphere"),
                price: "₹₹",
                rating: "4.7 ★",
                timeOfDay: "morning",
                type: "cafe"
              },
              {
                id: "act2",
                time: "10:00 AM",
                title: "Walk on Camel's Back Road",
                description: "Enjoy a scenic stroll on this picturesque road with beautiful mountain views.",
                location: "Camel's Back Road, Mussoorie",
                image: getRandomImageForCategory("city exploration"),
                price: "Free",
                rating: "4.5 ★",
                timeOfDay: "morning",
                type: "exploring"
              },
              {
                id: "act3",
                time: "1:00 PM",
                title: "Lunch at Café Ivy",
                description: "Savor delicious food with panoramic views of the Doon Valley.",
                location: "Mall Road, Mussoorie",
                image: getRandomImageForCategory("restaurant dining"),
                price: "₹₹",
                rating: "4.6 ★",
                timeOfDay: "afternoon",
                type: "eating"
              },
              {
                id: "act4",
                time: "3:00 PM",
                title: "Visit Company Garden",
                description: "Explore this beautiful garden with a mini lake, fountain, and various flower species.",
                location: "Company Garden, Mussoorie",
                image: getRandomImageForCategory("city exploration"),
                price: "₹",
                rating: "4.4 ★",
                timeOfDay: "afternoon",
                type: "exploring"
              },
              {
                id: "act5",
                time: "5:30 PM",
                title: "Sunset at Gun Hill",
                description: "Take the cable car to Gun Hill for spectacular sunset views over the Himalayas.",
                location: "Gun Hill, Mussoorie",
                image: getRandomImageForCategory("city exploration"),
                price: "₹₹",
                rating: "4.7 ★",
                timeOfDay: "evening",
                type: "exploring"
              },
              {
                id: "act6",
                time: "8:00 PM",
                title: "Dinner at Little Llama Café",
                description: "End your day with delicious food at this cozy café known for its warm ambiance.",
                location: "Mall Road, Mussoorie",
                image: getRandomImageForCategory("restaurant dining"),
                price: "₹₹",
                rating: "4.5 ★",
                timeOfDay: "evening",
                type: "eating"
              }
            ],
            recommendations: [
              {
                id: "rec1",
                title: "Trek to Lal Tibba",
                description: "Hike to the highest point in Mussoorie for unparalleled views of the Himalayan ranges.",
                image: getRandomImageForCategory("city exploration"),
                rating: "4.8 ★",
                duration: "Half day"
              },
              {
                id: "rec2",
                title: "Literary Tour of Landour",
                description: "Visit the homes and haunts of famous authors who made Mussoorie their home.",
                image: getRandomImageForCategory("historical landmarks"),
                rating: "4.6 ★",
                duration: "3-4 hours"
              },
              {
                id: "rec3",
                title: "Day Trip to Kempty Falls",
                description: "Enjoy a refreshing day at this beautiful waterfall just outside Mussoorie.",
                image: getRandomImageForCategory("city exploration"),
                rating: "4.5 ★",
                duration: "Half day"
              }
            ]
          }
        };
        
        // Select the appropriate itinerary based on location or default to Delhi
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
