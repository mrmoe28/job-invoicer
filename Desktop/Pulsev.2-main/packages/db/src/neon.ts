import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../schema';

// Neon HTTP connection - optimized for serverless
export function createNeonConnection() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required for Neon connection');
  }

  // Create Neon HTTP client
  const sql = neon(connectionString);
  
  // Create Drizzle database instance with schema
  const db = drizzle(sql, { 
    schema,
    logger: process.env.NODE_ENV === 'development' && process.env.ENABLE_DB_LOGGING === 'true'
  });

  return { db, sql };
}

// Singleton database connection for serverless optimization
let dbInstance: ReturnType<typeof createNeonConnection> | null = null;

export function getNeonDb() {
  if (!dbInstance) {
    dbInstance = createNeonConnection();
  }
  return dbInstance;
}

// Health check function for Neon
export async function checkNeonConnection(): Promise<boolean> {
  try {
    const { sql } = getNeonDb();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Neon database connection failed:', error);
    return false;
  }
}

// Database migration runner for Neon
export async function runMigrations() {
  try {
    const { db } = getNeonDb();
    console.log('Running database migrations...');
    
    // You can use drizzle-kit migrations or custom SQL here
    // For now, we'll log that migrations should be run via drizzle-kit
    console.log('Please run: pnpm db:migrate to apply schema changes');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Export for use in applications
export { schema };
export const { db, sql } = getNeonDb();
