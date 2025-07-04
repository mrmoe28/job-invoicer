import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Database configuration with proper error handling
let db: ReturnType<typeof drizzle> | null = null;
let sql: ReturnType<typeof neon> | null = null;

// Only initialize database on server side
if (typeof window === 'undefined') {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;

    // Check if we have a valid database URL
    if (databaseUrl &&
      databaseUrl !== 'postgresql://user:pass@host.neon.tech/dbname?sslmode=require' &&
      databaseUrl !== 'postgresql://username:password@ep-your-endpoint.region.aws.neon.tech/dbname?sslmode=require') {

      // Valid database URL - initialize Neon
      sql = neon(databaseUrl);
      db = drizzle(sql);
    } else {
      // Invalid or missing database URL
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
        console.error('DATABASE_URL is not properly configured for production!');
        console.error('Please set a valid Neon database URL in your Vercel environment variables.');
      } else {
        console.warn('⚠️  DATABASE_URL not configured properly.');
        console.warn('   Using null database for development.');
        console.warn('   To use a real database:');
        console.warn('   1. Go to https://neon.tech');
        console.warn('   2. Create a free database');
        console.warn('   3. Set DATABASE_URL in .env');
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    sql = null;
  }
} else {
  // Client-side - database should not be accessed
  console.warn('Database access attempted on client side');
}

// Helper function to check if database is available
export const isDatabaseAvailable = (): boolean => {
  return db !== null && sql !== null;
};

// Safe database access with null checks
export const safeDb = db;
export const safeSql = sql;

// Export with fallback error handling
export { db, sql };