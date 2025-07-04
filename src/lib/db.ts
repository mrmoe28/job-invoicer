// Main database exports for the application
// This replaces all Prisma references with Drizzle ORM

export { db, sql } from './drizzle-db';
export { db as drizzleDb } from './drizzle-db';
export * from './schema';
export { dbHelpers } from './db-helpers';

// For compatibility with old Prisma code being migrated
export const prisma = {
  $disconnect: async () => {
    // No-op for Drizzle - connection pooling is handled automatically
  }
};
