import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: any;
let db: any;

// Use mock database in development if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using mock database for development.");
  console.warn("To use a real database, set DATABASE_URL in your environment.");
  
  // Use mock database for development
  const mockDb = await import('./db.mock.js');
  pool = mockDb.pool;
  db = mockDb.db;
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };