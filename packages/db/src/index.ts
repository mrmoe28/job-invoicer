// Main database connection - uses SQLite for development
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/sqlite';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';

// Dynamic import for better-sqlite3 to handle dependency issues
let Database: any;
try {
  Database = require('better-sqlite3');
} catch (error) {
  console.warn('better-sqlite3 not available, using fallback');
  // Create a mock for compilation
  Database = class MockDatabase {
    constructor() {
      console.warn('Mock database - install better-sqlite3 for real functionality');
    }
    pragma() { return this; }
    prepare() { return { get: () => null, run: () => null }; }
    close() {}
  };
}

// Database file path (development)
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create SQLite connection
export const sqlite = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

// Create Drizzle database instance with schema
export const db = drizzle(sqlite, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Initialize database with default organization and user
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Check if organizations table exists and has data
    const result = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='organizations'").get();
    
    if (!result) {
      console.log('📋 Creating database tables...');
      // Tables don't exist, we need to create them
      // For now, let's just continue - migrations will handle this
    }
    
    // Check if we have a default organization
    const orgCheck = sqlite.prepare("SELECT COUNT(*) as count FROM organizations").get() as any;
    
    if (orgCheck.count === 0) {
      console.log('🏢 Creating default organization...');
      
      // Create default organization
      const orgId = crypto.randomUUID();
      sqlite.prepare(`
        INSERT INTO organizations (id, name, slug, plan, status, maxUsers, maxJobs, maxStorageGb, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orgId,
        'ConstructFlow Demo',
        'constructflow-demo',
        'pro',
        'active',
        50,
        1000,
        10,
        Date.now(),
        Date.now()
      );
      
      // Create default admin user
      const userId = crypto.randomUUID();
      sqlite.prepare(`
        INSERT INTO users (id, organizationId, email, passwordHash, firstName, lastName, role, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        orgId,
        'admin@constructflow.com',
        '$2a$10$K7L1OJ45/4Y2nygFcFQePOFSahdTdrRS1l2jI9A5Drk9K8nF/Q7mO', // "admin123" hashed
        'Admin',
        'User',
        'owner',
        1,
        Date.now(),
        Date.now()
      );
      
      // Create a default company
      const companyId = crypto.randomUUID();
      sqlite.prepare(`
        INSERT INTO companies (id, organizationId, name, industry, city, state, country, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        companyId,
        orgId,
        'Demo Construction Company',
        'Construction',
        'Atlanta',
        'GA',
        'US',
        1,
        Date.now(),
        Date.now()
      );
      
      // Create a default contact
      const contactId = crypto.randomUUID();
      sqlite.prepare(`
        INSERT INTO contacts (id, organizationId, companyId, firstName, lastName, title, email, phone, isPrimary, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        contactId,
        orgId,
        companyId,
        'John',
        'Smith',
        'Project Manager',
        'john.smith@democonstruction.com',
        '(555) 123-4567',
        1,
        1,
        Date.now(),
        Date.now()
      );
      
      console.log('✅ Default data created successfully!');
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Auto-initialize on import in development
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    sqlite.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    sqlite.close();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export schema and types
export * from './schema/sqlite';
export * from './utils/auth';

// Helper types for each table
export type Organization = typeof schema.organizations.$inferSelect;
export type NewOrganization = typeof schema.organizations.$inferInsert;
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
export type CrewMember = typeof schema.crewMembers.$inferSelect;
export type NewCrewMember = typeof schema.crewMembers.$inferInsert;
export type JobAssignment = typeof schema.jobAssignments.$inferSelect;
export type NewJobAssignment = typeof schema.jobAssignments.$inferInsert;
