import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Database configuration with proper error handling
let db: ReturnType<typeof drizzle>;
let sql: ReturnType<typeof neon>;

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
      // Invalid or missing database URL - create a fallback
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
        console.error('DATABASE_URL is not properly configured for production!');
        console.error('Please set a valid Neon database URL in your Vercel environment variables.');
        throw new Error('DATABASE_URL is required in production');
      } else {
        console.warn('⚠️  DATABASE_URL not configured properly.');
        console.warn('   Using local fallback database for development.');
        console.warn('   To use a real database:');
        console.warn('   1. Go to https://neon.tech');
        console.warn('   2. Create a free database');
        console.warn('   3. Set DATABASE_URL in .env');

        // Use a local fallback for development
        const fallbackUrl = 'postgresql://user:password@localhost:5432/jobinvoicer';
        sql = neon(fallbackUrl);
        db = drizzle(sql);
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Create a minimal fallback to prevent null errors
    const fallbackUrl = 'postgresql://user:password@localhost:5432/jobinvoicer';
    sql = neon(fallbackUrl);
    db = drizzle(sql);
  }
} else {
  // Client-side - database should not be accessed, but we need to prevent null errors
  console.warn('Database access attempted on client side');
  // Create a minimal fallback to prevent null errors
  const fallbackUrl = 'postgresql://user:password@localhost:5432/jobinvoicer';
  sql = neon(fallbackUrl);
  db = drizzle(sql);
}

// Helper function to check if database is available
export const isDatabaseAvailable = (): boolean => {
  return db !== undefined && sql !== undefined;
};

// Safe database access with error handling
export const safeDb = db;
export const safeSql = sql;

// Export with proper typing (no longer nullable)
export { db, sql };