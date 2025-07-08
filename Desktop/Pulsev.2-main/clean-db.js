#!/usr/bin/env node

const postgres = require('postgres');

// Database connection
const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_VhLHQJNKyW51@ep-floral-frog-a8pl2blz-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkAndCleanDatabase() {
  console.log('🔄 Connecting to Neon PostgreSQL database...');
  
  const sql = postgres(connectionString);

  try {
    console.log('🔍 Checking existing tables...');

    // Check what tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;

    console.log('📋 Existing tables:', tables.map(t => t.table_name));

    if (tables.length > 0) {
      console.log('🧹 Dropping existing tables to avoid conflicts...');
      
      // Drop tables in reverse dependency order
      const tablesToDrop = [
        'document_signatures',
        'document_templates', 
        'job_assignments',
        'tasks',
        'documents',
        'contractors',
        'jobs',
        'contacts',
        'companies',
        'user_sessions',
        'verification_tokens',
        'users',
        'organizations'
      ];

      for (const table of tablesToDrop) {
        try {
          await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE;`;
          console.log(`  ✅ Dropped table: ${table}`);
        } catch (error) {
          console.log(`  ℹ️ Table ${table} doesn't exist or already dropped`);
        }
      }
    }

    await sql.end();
    console.log('✅ Database cleanup completed!');
    console.log('💡 Now run: node migrate-db.js');

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    await sql.end();
    process.exit(1);
  }
}

checkAndCleanDatabase();
