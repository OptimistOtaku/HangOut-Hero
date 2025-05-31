import { users, type User, type InsertUser, type Itinerary } from "../shared/schema.js";
import type { ItineraryResponse } from "../client/src/lib/openai.js";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveItinerary(itinerary: ItineraryResponse): Promise<ItineraryResponse>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private itineraries: Map<string, ItineraryResponse>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.itineraries = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async saveItinerary(itinerary: ItineraryResponse): Promise<ItineraryResponse> {
    // Generate a simple UUID-like ID for the itinerary
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.itineraries.set(id, itinerary);
    return itinerary;
  }
}

export const storage = new MemStorage();
