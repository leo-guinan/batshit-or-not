import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  console.log("Registration attempt:", { body: req.body });
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if username or email already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    
    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    
    // Create user
    const user = await storage.createUser({
      username: validatedData.username,
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName || null,
      lastName: validatedData.lastName || null,
      profileImageUrl: null,
    });
    
    // Initialize user stats
    await storage.initializeUserStats(user.id);
    
    // Set up session
    (req.session as any).userId = user.id;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to save session" });
      }
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  console.log("Login attempt:", { body: req.body });
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set up session
    (req.session as any).userId = user.id;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to save session" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function getCurrentUser(req: Request, res: Response) {
  console.log("getCurrentUser - Session:", {
    sessionID: req.sessionID,
    session: req.session,
    userId: (req.session as any)?.userId,
    cookie: req.session?.cookie,
  });
  
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      console.error("User not found in storage:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}