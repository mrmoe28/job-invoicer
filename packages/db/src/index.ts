import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pulsecrm';

// Configure postgres connection with optimizations
const connectionOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pulsecrm',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Better for serverless
};

// Create connection
export const sql = postgres(connectionString, connectionOptions);

// Create Drizzle database instance with schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development' && process.env.ENABLE_DB_LOGGING === 'true'
});

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await sql.end();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export schema and types
export * from './schema';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Helper types for each table
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Company = typeof schema.companies.$inferSelect;
export type NewCompany = typeof schema.companies.$inferInsert;
export type Contact = typeof schema.contacts.$inferSelect;
export type NewContact = typeof schema.contacts.$inferInsert;
export type Job = typeof schema.jobs.$inferSelect;
export type NewJob = typeof schema.jobs.$inferInsert;
export type Task = typeof schema.tasks.$inferSelect;
export type NewTask = typeof schema.tasks.$inferInsert;
export type Document = typeof schema.documents.$inferSelect;
export type NewDocument = typeof schema.documents.$inferInsert;
export type TimeEntry = typeof schema.timeEntries.$inferSelect;
export type NewTimeEntry = typeof schema.timeEntries.$inferInsert;
export type Invoice = typeof schema.invoices.$inferSelect;
export type NewInvoice = typeof schema.invoices.$inferInsert;
export type ActivityLogEntry = typeof schema.activityLog.$inferSelect;
export type NewActivityLogEntry = typeof schema.activityLog.$inferInsert;
