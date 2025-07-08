#!/usr/bin/env node

const postgres = require('postgres');

const connectionString = 'postgresql://neondb_owner:npg_VhLHQJNKyW51@ep-floral-frog-a8pl2blz-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function seedDocuments() {
  console.log('🌱 Seeding sample documents...');
  
  const sql = postgres(connectionString);

  try {
    // Get the organization ID
    const [org] = await sql`
      SELECT id FROM organizations WHERE slug = 'pulse-solar' LIMIT 1;
    `;

    if (!org) {
      console.error('❌ No organization found. Please run the migration script first.');
      process.exit(1);
    }

    // Get the user ID
    const [user] = await sql`
      SELECT id FROM users WHERE email = 'admin@pulsecrm.com' LIMIT 1;
    `;

    if (!user) {
      console.error('❌ No user found. Please run the migration script first.');
      process.exit(1);
    }

    console.log(`✅ Found organization: ${org.id}`);
    console.log(`✅ Found user: ${user.id}`);

    // Insert sample documents
    await sql`
      INSERT INTO documents (
        organization_id, 
        file_name, 
        original_file_name, 
        file_path, 
        file_size, 
        mime_type, 
        file_type, 
        category, 
        title, 
        description, 
        uploaded_by_user_id, 
        status
      ) VALUES 
      (
        ${org.id}, 
        'sample_contract.pdf', 
        'Solar Installation Contract.pdf', 
        '/samples/contract.pdf', 
        2458000, 
        'application/pdf', 
        'pdf', 
        'contract', 
        'Sample Solar Installation Contract', 
        'Template contract for solar installations', 
        ${user.id}, 
        'active'
      ),
      (
        ${org.id}, 
        'sample_permit.pdf', 
        'Building Permit Application.pdf', 
        '/samples/permit.pdf', 
        1892000, 
        'application/pdf', 
        'pdf', 
        'permit', 
        'Sample Building Permit Application', 
        'Template permit application for building permits', 
        ${user.id}, 
        'active'
      )
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Sample documents inserted successfully!');

    await sql.end();
    console.log('🎉 Document seeding completed!');

  } catch (error) {
    console.error('❌ Document seeding failed:', error);
    await sql.end();
    process.exit(1);
  }
}

seedDocuments();
