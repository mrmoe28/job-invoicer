import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { sql } from '@vercel/postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import * as schema from './db-schema';

// Define environment variables
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const DATABASE_URL = process.env.DATABASE_URL;

// Check if we have a database URL
if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not defined. Using fallback in-memory database.');
}

// Initialize database client
let db: ReturnType<typeof drizzle<typeof schema>> | ReturnType<typeof drizzleNeon<typeof schema>>;

if (isVercel) {
  // On Vercel, use Neon serverless
  try {
    const client = neon(DATABASE_URL!);
    db = drizzleNeon(client, { schema });
    console.log('Connected to Neon database using serverless driver');
  } catch (error) {
    console.error('Failed to initialize Neon serverless connection:', error);
    throw error;
  }
} else if (isProduction) {
  // In production (not Vercel), use regular postgres client
  try {
    const pool = new Pool({
      connectionString: DATABASE_URL,
    });
    db = drizzle(pool, { schema });
    console.log('Connected to Postgres database using connection pool');
  } catch (error) {
    console.error('Failed to initialize Postgres connection pool:', error);
    throw error;
  }
} else {
  // In development, use Vercel Postgres or Neon
  if (DATABASE_URL?.includes('postgres.vercel-storage.com')) {
    try {
      db = drizzle(sql, { schema });
      console.log('Connected to Vercel Postgres database');
    } catch (error) {
      console.error('Failed to initialize Vercel Postgres connection:', error);
      throw error;
    }
  } else {
    try {
      const pool = new Pool({
        connectionString: DATABASE_URL,
      });
      db = drizzle(pool, { schema });
      console.log('Connected to local Postgres database');
    } catch (error) {
      console.error('Failed to initialize local Postgres connection:', error);
      throw error;
    }
  }
}

export { db };
