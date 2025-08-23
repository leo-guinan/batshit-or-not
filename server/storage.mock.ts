import type { IStorage } from "./storage";
import type { User, Idea, InsertIdea, InsertRating, Rating, UserStats, Friendship } from "@shared/schema";
import { v4 as uuidv4 } from "crypto";

// In-memory storage
const users = new Map<string, User>();
const ideas = new Map<string, Idea>();
const ratings = new Map<string, Rating>();
const userStats = new Map<string, UserStats>();
const friendships = new Map<string, Friendship>();

export class MockStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(users.values()).find(u => u.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    if (userData.id && users.has(userData.id)) {
      const existing = users.get(userData.id)!;
      const updated = { ...existing, ...userData, updatedAt: new Date() };
      users.set(userData.id, updated);
      return updated;
    }
    return this.createUser(userData);
  }

  async createIdea(ideaData: InsertIdea & { authorId: string }): Promise<Idea> {
    const idea: Idea = {
      ...ideaData,
      id: uuidv4(),
      averageRating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    ideas.set(idea.id, idea);
    
    // Update user stats
    const stats = userStats.get(ideaData.authorId);
    if (stats) {
      stats.ideasSubmitted = (stats.ideasSubmitted || 0) + 1;
      stats.updatedAt = new Date();
    }
    
    return idea;
  }

  async getIdeas(filter?: 'fresh' | 'trending' | 'hall-of-fame', limit = 20, offset = 0): Promise<(Idea & { author: User | null })[]> {
    let ideaList = Array.from(ideas.values());
    
    // Apply filter
    switch (filter) {
      case 'fresh':
        ideaList.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        break;
      case 'trending':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        ideaList = ideaList.filter(i => (i.createdAt?.getTime() || 0) > oneDayAgo.getTime());
        ideaList.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        break;
      case 'hall-of-fame':
        ideaList = ideaList.filter(i => (i.ratingCount || 0) >= 10);
        ideaList.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        ideaList.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }
    
    // Apply pagination
    ideaList = ideaList.slice(offset, offset + limit);
    
    // Add author info
    return ideaList.map(idea => ({
      ...idea,
      author: idea.isAnonymous ? null : users.get(idea.authorId) || null,
    }));
  }

  async getIdeaById(id: string): Promise<(Idea & { author: User | null }) | undefined> {
    const idea = ideas.get(id);
    if (!idea) return undefined;
    
    return {
      ...idea,
      author: idea.isAnonymous ? null : users.get(idea.authorId) || null,
    };
  }

  async updateIdeaRating(ideaId: string, averageRating: number, ratingCount: number): Promise<void> {
    const idea = ideas.get(ideaId);
    if (idea) {
      idea.averageRating = averageRating;
      idea.ratingCount = ratingCount;
      idea.updatedAt = new Date();
    }
  }

  async createRating(ratingData: InsertRating & { userId: string }): Promise<Rating> {
    const rating: Rating = {
      ...ratingData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    ratings.set(`${ratingData.userId}-${ratingData.ideaId}`, rating);
    
    // Update idea's average rating
    const ideaRatings = Array.from(ratings.values()).filter(r => r.ideaId === ratingData.ideaId);
    const avg = ideaRatings.reduce((sum, r) => sum + r.rating, 0) / ideaRatings.length;
    await this.updateIdeaRating(ratingData.ideaId, avg, ideaRatings.length);
    
    // Update user stats
    const stats = userStats.get(ratingData.userId);
    if (stats) {
      stats.ratingsGiven = (stats.ratingsGiven || 0) + 1;
      stats.updatedAt = new Date();
    }
    
    return rating;
  }

  async getUserRatingForIdea(userId: string, ideaId: string): Promise<Rating | undefined> {
    return ratings.get(`${userId}-${ideaId}`);
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return userStats.get(userId);
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    const stats = userStats.get(userId);
    if (stats) {
      Object.assign(stats, updates, { updatedAt: new Date() });
    }
  }

  async initializeUserStats(userId: string): Promise<UserStats> {
    if (userStats.has(userId)) {
      return userStats.get(userId)!;
    }
    
    const stats: UserStats = {
      id: uuidv4(),
      userId,
      ideasSubmitted: 0,
      ratingsGiven: 0,
      averageRatingReceived: 0,
      totalRatingsReceived: 0,
      batshitScore: 0,
      achievements: [],
      updatedAt: new Date(),
    };
    userStats.set(userId, stats);
    return stats;
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const existing = Array.from(friendships.values()).find(
      f => (f.userId === userId && f.friendId === friendId) ||
           (f.userId === friendId && f.friendId === userId)
    );
    
    if (existing) {
      throw new Error("Friendship already exists or pending");
    }
    
    const friendship: Friendship = {
      id: uuidv4(),
      userId,
      friendId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    friendships.set(friendship.id, friendship);
    return friendship;
  }

  async respondToFriendRequest(friendshipId: string, status: 'accepted' | 'rejected'): Promise<Friendship> {
    const friendship = friendships.get(friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }
    
    friendship.status = status;
    friendship.updatedAt = new Date();
    return friendship;
  }

  async getFriends(userId: string): Promise<(User & { friendship: Friendship })[]> {
    const userFriendships = Array.from(friendships.values()).filter(
      f => f.status === "accepted" && (f.userId === userId || f.friendId === userId)
    );
    
    return userFriendships.map(f => {
      const friendId = f.userId === userId ? f.friendId : f.userId;
      const friend = users.get(friendId);
      if (!friend) return null;
      return { ...friend, friendship: f };
    }).filter(Boolean) as (User & { friendship: Friendship })[];
  }

  async getPendingFriendRequests(userId: string): Promise<(User & { friendship: Friendship })[]> {
    const pending = Array.from(friendships.values()).filter(
      f => f.status === "pending" && f.friendId === userId
    );
    
    return pending.map(f => {
      const requester = users.get(f.userId);
      if (!requester) return null;
      return { ...requester, friendship: f };
    }).filter(Boolean) as (User & { friendship: Friendship })[];
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = Array.from(friendships.values()).find(
      f => (f.userId === userId && f.friendId === friendId) ||
           (f.userId === friendId && f.friendId === userId)
    );
    
    if (friendship) {
      friendships.delete(friendship.id);
    }
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const q = query.toLowerCase();
    return Array.from(users.values()).filter(u => {
      if (u.id === currentUserId) return false;
      return (
        u.username?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }).slice(0, 10);
  }

  async getRatingComparison(userId: string): Promise<{
    userAverage: number;
    friendsAverage: number;
    globalAverage: number;
    categoryBreakdown: Array<{
      category: string;
      userAverage: number;
      friendsAverage: number;
      globalAverage: number;
    }>;
  }> {
    // Simple mock implementation
    return {
      userAverage: 5.5,
      friendsAverage: 6.2,
      globalAverage: 5.8,
      categoryBreakdown: [
        { category: 'technology', userAverage: 6, friendsAverage: 6.5, globalAverage: 6.2 },
        { category: 'lifestyle', userAverage: 5, friendsAverage: 5.8, globalAverage: 5.5 },
      ],
    };
  }
}