import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// For development, you can use a local PostgreSQL database or get a free Neon database at https://neon.tech
const databaseUrl = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/job_invoicer?sslmode=disable';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not found in environment variables. Using default local database URL.');
  console.warn('   For production, please set DATABASE_URL to your Neon database connection string.');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);

// Helper function for raw SQL queries if needed
export { sql };