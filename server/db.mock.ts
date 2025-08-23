// Mock database for local development without a real database
import type { User, Idea, Rating, UserStats, Friendship } from "@shared/schema";

// In-memory storage
const users = new Map<string, User>();
const ideas = new Map<string, Idea>();
const ratings = new Map<string, Rating>();
const userStats = new Map<string, UserStats>();
const friendships = new Map<string, Friendship>();
const sessions = new Map<string, any>();

// Mock drizzle db object
export const db = {
  select: () => ({
    from: () => ({
      where: () => [],
    }),
  }),
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => [data],
      onConflictDoUpdate: () => ({
        returning: () => [data],
      }),
      onConflictDoNothing: () => ({
        returning: () => [data],
      }),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => {},
    }),
  }),
  delete: () => ({
    where: () => {},
  }),
  execute: () => Promise.resolve(),
};

// Export mock pool for session store
export const pool = {
  query: (text: string, params?: any[]) => {
    // Simple session store implementation
    if (text.includes('CREATE TABLE IF NOT EXISTS')) {
      return Promise.resolve({ rows: [] });
    }
    if (text.includes('SELECT sess FROM')) {
      const sid = params?.[0];
      const session = sessions.get(sid);
      return Promise.resolve({ rows: session ? [{ sess: session }] : [] });
    }
    if (text.includes('INSERT INTO') || text.includes('UPDATE')) {
      const sid = params?.[0];
      const sess = params?.[1];
      sessions.set(sid, sess);
      return Promise.resolve({ rows: [] });
    }
    if (text.includes('DELETE FROM')) {
      const sid = params?.[0];
      sessions.delete(sid);
      return Promise.resolve({ rows: [] });
    }
    return Promise.resolve({ rows: [] });
  },
};