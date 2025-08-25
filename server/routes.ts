import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { register, login, logout, isAuthenticated, getCurrentUser } from "./auth";
import { insertIdeaSchema, insertRatingSchema, insertFriendshipSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (before session middleware for efficiency)
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Trust proxy for production (needed for secure cookies behind load balancer)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Session setup
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'batshit-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    },
    name: 'batshit.sid', // Custom session name
  };

  // Only use PostgreSQL session store if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    sessionConfig.store = new PgSession({
      pool: (db as any).pool,
      tableName: 'sessions',
    });
    console.log('Using PostgreSQL session store');
  } else {
    console.log('Using memory session store (no DATABASE_URL)');
  }

  app.use(session(sessionConfig));

  // Auth routes
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.post('/api/auth/logout', logout);
  app.get('/api/auth/user', getCurrentUser);

  // Ideas routes
  app.get("/api/ideas", async (req, res) => {
    try {
      const filter = req.query.filter as 'fresh' | 'trending' | 'hall-of-fame' | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const ideas = await storage.getIdeas(filter, limit, offset);
      
      // Hide author info for anonymous ideas
      const processedIdeas = ideas.map(idea => ({
        ...idea,
        author: idea.isAnonymous ? null : idea.author
      }));
      
      res.json(processedIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  app.post("/api/ideas", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertIdeaSchema.parse(req.body);
      
      const idea = await storage.createIdea({
        ...validatedData,
        authorId: userId,
      });
      
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating idea:", error);
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const idea = await storage.getIdeaById(req.params.id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Hide author info for anonymous ideas
      if (idea.isAnonymous) {
        idea.author = null;
      }
      
      res.json(idea);
    } catch (error) {
      console.error("Error fetching idea:", error);
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  // Ratings routes
  app.post("/api/ratings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertRatingSchema.parse(req.body);
      
      // Check if user already rated this idea
      const existingRating = await storage.getUserRatingForIdea(userId, validatedData.ideaId);
      if (existingRating) {
        return res.status(409).json({ message: "You have already rated this idea" });
      }
      
      const rating = await storage.createRating({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/check/:ideaId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const rating = await storage.getUserRatingForIdea(userId, req.params.ideaId);
      res.json({ hasRated: !!rating, rating: rating?.rating });
    } catch (error) {
      console.error("Error checking rating:", error);
      res.status(500).json({ message: "Failed to check rating" });
    }
  });

  // User stats routes
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.id);
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const stats = await storage.getUserStats(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        stats,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Friendship routes
  app.post("/api/friendships/request", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { friendId } = req.body;
      
      if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
      }
      
      if (userId === friendId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }
      
      const friendship = await storage.sendFriendRequest(userId, friendId);
      res.status(201).json(friendship);
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        return res.status(409).json({ message: "Friend request already exists or pending" });
      }
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friendships/:id/respond", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }
      
      const friendship = await storage.respondToFriendRequest(req.params.id, status);
      res.json(friendship);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      console.error("Error responding to friend request:", error);
      res.status(500).json({ message: "Failed to respond to friend request" });
    }
  });

  app.get("/api/friendships", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const friends = await storage.getFriends(userId);
      
      // Remove password hash from response
      const sanitizedFriends = friends.map(({ passwordHash, ...friend }) => friend);
      
      res.json(sanitizedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friendships/pending", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const pendingRequests = await storage.getPendingFriendRequests(userId);
      
      // Remove password hash from response
      const sanitizedRequests = pendingRequests.map(({ passwordHash, ...request }) => request);
      
      res.json(sanitizedRequests);
    } catch (error) {
      console.error("Error fetching pending friend requests:", error);
      res.status(500).json({ message: "Failed to fetch pending friend requests" });
    }
  });

  app.delete("/api/friendships/:friendId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      await storage.removeFriend(userId, req.params.friendId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  app.get("/api/users/search", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const users = await storage.searchUsers(query, userId);
      
      // Remove password hash from response
      const sanitizedUsers = users.map(({ passwordHash, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get("/api/ratings/comparison", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const comparison = await storage.getRatingComparison(userId);
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching rating comparison:", error);
      res.status(500).json({ message: "Failed to fetch rating comparison" });
    }
  });

  const server = createServer(app);
  return server;
}