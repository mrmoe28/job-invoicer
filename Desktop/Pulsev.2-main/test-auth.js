// Test user authentication for Pulse CRM
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function testUserAuth() {
  try {
    console.log('🔐 Testing User Authentication...');
    
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not set');
      return;
    }

    const client = neon(DATABASE_URL);
    
    // Check users and their password hashes
    console.log('\n👥 Checking user credentials...');
    const users = await client`
      SELECT email, password_hash, first_name, last_name, role, is_active, email_verified_at 
      FROM users 
      ORDER BY created_at
    `;
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Email Verified: ${user.email_verified_at ? 'Yes' : 'No'}`);
      console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);
    });

    // Test password verification
    console.log('\n🔍 Testing password verification...');
    const adminUser = users.find(u => u.email === 'admin@pulsecrm.com');
    
    if (adminUser) {
      const testPassword = 'admin123';
      console.log(`Testing password: "${testPassword}"`);
      
      try {
        const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
        console.log(`Password match: ${isValid ? '✅ YES' : '❌ NO'}`);
        
        if (!isValid) {
          // Try generating a new hash to see what it should look like
          const newHash = await bcrypt.hash(testPassword, 10);
          console.log(`Expected hash format: ${newHash.substring(0, 20)}...`);
          console.log(`Actual hash format:   ${adminUser.password_hash.substring(0, 20)}...`);
        }
      } catch (error) {
        console.error('❌ Error comparing passwords:', error.message);
      }
    } else {
      console.log('❌ Admin user not found');
    }

    // Check if there are any password reset tokens
    const usersWithTokens = users.filter(u => u.reset_token);
    if (usersWithTokens.length > 0) {
      console.log('\n🔑 Users with reset tokens:');
      usersWithTokens.forEach(u => {
        console.log(`   ${u.email}: has reset token`);
      });
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testUserAuth();