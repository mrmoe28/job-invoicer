// Fix admin user password in Pulse CRM
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin user password...');
    
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not set');
      return;
    }

    const client = neon(DATABASE_URL);
    
    // Generate correct password hash for "admin123"
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`Generated new hash for password "${password}"`);
    console.log(`New hash: ${hashedPassword}`);
    
    // Update the admin user
    const result = await client`
      UPDATE users 
      SET password_hash = ${hashedPassword},
          email_verified_at = NOW(),
          is_active = true
      WHERE email = 'admin@pulsecrm.com'
      RETURNING email, first_name, last_name, role
    `;
    
    if (result.length > 0) {
      console.log('✅ Admin user password updated successfully!');
      console.log(`   User: ${result[0].first_name} ${result[0].last_name}`);
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Role: ${result[0].role}`);
      
      // Test the new password
      console.log('\n🧪 Testing new password...');
      const testResult = await bcrypt.compare(password, hashedPassword);
      console.log(`Password verification: ${testResult ? '✅ SUCCESS' : '❌ FAILED'}`);
      
    } else {
      console.log('❌ No user updated - admin user not found');
    }

    // Also update the sales user
    console.log('\n👤 Updating sales user password...');
    const salesResult = await client`
      UPDATE users 
      SET password_hash = ${hashedPassword},
          email_verified_at = NOW(),
          is_active = true
      WHERE email = 'sales@pulsecrm.com'
      RETURNING email, first_name, last_name, role
    `;
    
    if (salesResult.length > 0) {
      console.log('✅ Sales user password updated successfully!');
      console.log(`   User: ${salesResult[0].first_name} ${salesResult[0].last_name}`);
      console.log(`   Email: ${salesResult[0].email}`);
      console.log(`   Role: ${salesResult[0].role}`);
    }

    console.log('\n🎉 Password fix complete!');
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@pulsecrm.com / admin123');
    console.log('   Sales: sales@pulsecrm.com / admin123');

  } catch (error) {
    console.error('❌ Password fix failed:', error.message);
  }
}

fixAdminPassword();