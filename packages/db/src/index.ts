import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pulsecrm';

export const sql = postgres(connectionString);
export const db = drizzle(sql);

export * from './schema';
