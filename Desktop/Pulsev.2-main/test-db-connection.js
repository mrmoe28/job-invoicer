// Quick database connection test for Pulse CRM (TypeScript)
// Run this to verify the new schema works with your database

const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Get DATABASE_URL from environment
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('💡 Please check your .env.local file or set the DATABASE_URL');
      return;
    }
    
    console.log('📡 Connecting to database...');
    const client = neon(DATABASE_URL);
    const db = drizzle(client);
    
    // Test 1: Simple query to check connection
    console.log('\n📊 Testing basic database connection...');
    const result = await client`SELECT NOW() as current_time, version() as version`;
    console.log('✅ Database connection successful!');
    console.log(`   Current time: ${result[0].current_time}`);
    console.log(`   PostgreSQL version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);

    // Test 2: Check if our tables exist
    console.log('\n🏗️  Checking if tables exist...');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Test 3: Check if demo data exists
    console.log('\n🎯 Checking for demo data...');
    const orgs = await client`SELECT name, slug, business_type FROM organizations LIMIT 5`;
    
    if (orgs.length > 0) {
      console.log(`✅ Found ${orgs.length} organizations:`);
      orgs.forEach(org => {
        console.log(`   - ${org.name} (${org.slug}) - ${org.business_type}`);
      });
    } else {
      console.log('⚠️  No organizations found - you may need to add data');
    }

    // Test 4: Check users
    console.log('\n👥 Checking for users...');
    const users = await client`SELECT first_name, last_name, email, role FROM users LIMIT 5`;
    
    if (users.length > 0) {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('⚠️  No users found - you may need to add users');
    }

    console.log('\n🎉 Database connection test completed successfully!');
    console.log('✅ Your Pulse CRM database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    
    if (error.message.includes('CONNECTION_TIMEOUT')) {
      console.log('\n💡 Tip: Database connection timed out');
      console.log('   - Check your internet connection');
      console.log('   - Verify your DATABASE_URL is correct');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Tip: Database authentication failed');
      console.log('   - Check your database credentials in DATABASE_URL');
      console.log('   - Make sure your Neon database is active');
    }
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Tables do not exist');
      console.log('   - Make sure you ran the SQL schema in your Neon database');
      console.log('   - Check that all CREATE TABLE statements executed successfully');
    }
  }
}

// Run the test
testDatabaseConnection();