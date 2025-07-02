import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../packages/db/src/schema/postgres';

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/constructflow_dev';

// Create PostgreSQL connection with fallback handling
let client: postgres.Sql;
try {
    client = postgres(connectionString, {
        max: 1, // Vercel serverless functions work better with single connections
        idle_timeout: 20,
        connect_timeout: 10,
    });
} catch (error) {
    console.error('Database connection failed:', error);
    // For development, we'll handle this gracefully
    throw new Error('Database connection failed. Please set up your database.');
}

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Helper function to set organization context for RLS (SQLite doesn't need this)
export async function setOrganizationContext(_organizationId: string) {
    // SQLite doesn't support RLS, so this is a no-op
    // Organization filtering will be done in queries
}

// Helper function to get current user's organization
export async function getCurrentOrganization(userId: string) {
    const result = await db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, userId),
        with: {
            organization: true
        }
    });
    return result?.organization;
}

export type Database = typeof db;
export { schema }; 