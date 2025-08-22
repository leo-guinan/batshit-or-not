import {
  users,
  ideas,
  ratings,
  userStats,
  friendships,
  type User,
  type UpsertUser,
  type Idea,
  type InsertIdea,
  type InsertRating,
  type Rating,
  type UserStats,
  type InsertFriendship,
  type Friendship,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Idea operations
  createIdea(idea: InsertIdea & { authorId: string }): Promise<Idea>;
  getIdeas(filter?: 'fresh' | 'trending' | 'hall-of-fame', limit?: number, offset?: number): Promise<(Idea & { author: User | null })[]>;
  getIdeaById(id: string): Promise<(Idea & { author: User | null }) | undefined>;
  updateIdeaRating(ideaId: string, averageRating: number, ratingCount: number): Promise<void>;
  
  // Rating operations
  createRating(rating: InsertRating & { userId: string }): Promise<Rating>;
  getUserRatingForIdea(userId: string, ideaId: string): Promise<Rating | undefined>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void>;
  initializeUserStats(userId: string): Promise<UserStats>;
  
  // Friendship operations
  sendFriendRequest(userId: string, friendId: string): Promise<Friendship>;
  respondToFriendRequest(friendshipId: string, status: 'accepted' | 'rejected'): Promise<Friendship>;
  getFriends(userId: string): Promise<(User & { friendship: Friendship })[]>;
  getPendingFriendRequests(userId: string): Promise<(User & { friendship: Friendship })[]>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  searchUsers(query: string, currentUserId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Initialize user stats if this is a new user
    await this.initializeUserStats(user.id).catch(() => {}); // Ignore if already exists
    
    return user;
  }

  async createIdea(ideaData: InsertIdea & { authorId: string }): Promise<Idea> {
    const [idea] = await db.insert(ideas).values(ideaData).returning();
    
    // Update user stats
    await db.execute(sql`
      UPDATE user_stats 
      SET ideas_submitted = ideas_submitted + 1, updated_at = now()
      WHERE user_id = ${ideaData.authorId}
    `);
    
    return idea;
  }

  async getIdeas(filter?: 'fresh' | 'trending' | 'hall-of-fame', limit = 20, offset = 0): Promise<(Idea & { author: User | null })[]> {
    let query = db
      .select({
        id: ideas.id,
        authorId: ideas.authorId,
        text: ideas.text,
        category: ideas.category,
        isAnonymous: ideas.isAnonymous,
        averageRating: ideas.averageRating,
        ratingCount: ideas.ratingCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        author: users,
      })
      .from(ideas)
      .leftJoin(users, eq(ideas.authorId, users.id))
      .limit(limit)
      .offset(offset);

    switch (filter) {
      case 'fresh':
        query = query.orderBy(desc(ideas.createdAt));
        break;
      case 'trending':
        query = query
          .where(sql`${ideas.createdAt} > now() - interval '24 hours'`)
          .orderBy(desc(ideas.ratingCount));
        break;
      case 'hall-of-fame':
        query = query
          .where(sql`${ideas.ratingCount} >= 10`)
          .orderBy(desc(ideas.averageRating));
        break;
      default:
        query = query.orderBy(desc(ideas.createdAt));
    }

    return query;
  }

  async getIdeaById(id: string): Promise<(Idea & { author: User | null }) | undefined> {
    const [result] = await db
      .select({
        id: ideas.id,
        authorId: ideas.authorId,
        text: ideas.text,
        category: ideas.category,
        isAnonymous: ideas.isAnonymous,
        averageRating: ideas.averageRating,
        ratingCount: ideas.ratingCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        author: users,
      })
      .from(ideas)
      .leftJoin(users, eq(ideas.authorId, users.id))
      .where(eq(ideas.id, id));

    return result;
  }

  async updateIdeaRating(ideaId: string, averageRating: number, ratingCount: number): Promise<void> {
    await db
      .update(ideas)
      .set({ averageRating, ratingCount, updatedAt: new Date() })
      .where(eq(ideas.id, ideaId));
  }

  async createRating(ratingData: InsertRating & { userId: string }): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(ratingData).returning();
    
    // Recalculate idea's average rating
    const [ideaRatings] = await db
      .select({
        avg: sql<number>`AVG(${ratings.rating})::float`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(ratings)
      .where(eq(ratings.ideaId, ratingData.ideaId));

    if (ideaRatings) {
      await this.updateIdeaRating(ratingData.ideaId, ideaRatings.avg, ideaRatings.count);
    }
    
    // Update user stats
    await db.execute(sql`
      UPDATE user_stats 
      SET ratings_given = ratings_given + 1, updated_at = now()
      WHERE user_id = ${ratingData.userId}
    `);
    
    return rating;
  }

  async getUserRatingForIdea(userId: string, ideaId: string): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.ideaId, ideaId)));
    
    return rating;
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    await db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId));
  }

  async initializeUserStats(userId: string): Promise<UserStats> {
    const [stats] = await db
      .insert(userStats)
      .values({ userId })
      .onConflictDoNothing()
      .returning();
    
    if (stats) {
      return stats;
    }
    
    // If conflict occurred, return existing stats
    const existing = await this.getUserStats(userId);
    return existing!;
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendship already exists
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      );

    if (existing.length > 0) {
      throw new Error("Friendship already exists or pending");
    }

    const [friendship] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: "pending",
      })
      .returning();

    return friendship;
  }

  async respondToFriendRequest(friendshipId: string, status: 'accepted' | 'rejected'): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId))
      .returning();

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    return friendship;
  }

  async getFriends(userId: string): Promise<(User & { friendship: Friendship })[]> {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        friendship: friendships,
      })
      .from(friendships)
      .innerJoin(users, 
        or(
          and(eq(friendships.friendId, users.id), eq(friendships.userId, userId)),
          and(eq(friendships.userId, users.id), eq(friendships.friendId, userId))
        )
      )
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(eq(friendships.userId, userId), eq(friendships.friendId, userId))
        )
      );

    return results;
  }

  async getPendingFriendRequests(userId: string): Promise<(User & { friendship: Friendship })[]> {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        friendship: friendships,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      );

    return results;
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      );
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const results = await db
      .select()
      .from(users)
      .where(
        and(
          sql`${users.id} != ${currentUserId}`,
          or(
            sql`${users.firstName} ILIKE ${`%${query}%`}`,
            sql`${users.lastName} ILIKE ${`%${query}%`}`,
            sql`${users.email} ILIKE ${`%${query}%`}`
          )
        )
      )
      .limit(10);

    return results;
  }
}

export const storage = new DatabaseStorage();
