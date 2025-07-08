// Neon-optimized database connection following official best practices
// Reference: https://neon.com/docs/guides/nextjs

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isDatabaseUrl = process.env.DATABASE_URL?.startsWith('postgres');

// Use Neon serverless driver for optimal serverless performance
export function createNeonDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for Neon connection');
  }

  // Create Neon HTTP client - optimized for serverless/edge environments
  const sql = neon(connectionString);
  
  // Create Drizzle database instance with schema
  const db = drizzle(sql, { 
    schema,
    logger: process.env.NODE_ENV === 'development' && process.env.ENABLE_DB_LOGGING === 'true'
  });

  return { db, sql };
}

// Singleton pattern for serverless optimization
let dbInstance: ReturnType<typeof createNeonDatabase> | null = null;

export function getNeonDb() {
  if (!dbInstance) {
    dbInstance = createNeonDatabase();
  }
  return dbInstance;
}

// Health check for Neon connection
export async function checkNeonConnection(): Promise<boolean> {
  try {
    const { sql } = getNeonDb();
    const result = await sql`SELECT 1 as health_check`;
    return result.length > 0;
  } catch (error) {
    console.error('Neon database connection failed:', error);
    return false;
  }
}

// Database utilities
export async function getDatabaseVersion(): Promise<string> {
  try {
    const { sql } = getNeonDb();
    const result = await sql`SELECT version()`;
    return result[0]?.version || 'Unknown';
  } catch (error) {
    console.error('Failed to get database version:', error);
    return 'Error';
  }
}

// Export for use in Next.js applications
export const { db, sql } = getNeonDb();
export { schema };

// Type exports for the application
export type Database = typeof db;
export type SQL = typeof sql;
