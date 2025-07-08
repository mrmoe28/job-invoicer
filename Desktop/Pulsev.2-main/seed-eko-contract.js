#!/usr/bin/env node

const postgres = require('postgres');

const connectionString = 'postgresql://neondb_owner:npg_VhLHQJNKyW51@ep-floral-frog-a8pl2blz-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function seedEkoSolarContract() {
  console.log('🌱 Adding EKO Solar contract template...');
  
  const sql = postgres(connectionString);

  try {
    // Get the organization ID
    const [org] = await sql`
      SELECT id FROM organizations WHERE slug = 'pulse-solar' LIMIT 1;
    `;

    const [user] = await sql`
      SELECT id FROM users WHERE email = 'admin@pulsecrm.com' LIMIT 1;
    `;

    // Insert the EKO Solar contract as a document template
    await sql`
      INSERT INTO document_templates (
        organization_id, 
        name, 
        description, 
        category, 
        template_type, 
        signature_fields, 
        variables, 
        is_default, 
        is_active, 
        created_by_user_id
      ) VALUES (
        ${org.id}, 
        'EKO Solar Installation Agreement', 
        'Standard solar installation contract template for EKO Solar LLC with customer and contractor signature fields', 
        'contract', 
        'pdf', 
        '[
          {
            "id": "contractor_signature",
            "label": "Contractor Signature",
            "required": true,
            "signer_role": "contractor",
            "page": 6,
            "x": 150,
            "y": 400,
            "width": 200,
            "height": 60
          },
          {
            "id": "owner_signature", 
            "label": "Owner Signature",
            "required": true,
            "signer_role": "customer",
            "page": 6,
            "x": 450,
            "y": 400,
            "width": 200,
            "height": 60
          }
        ]',
        '{
          "contractor_name": "EKO SOLAR.LLC",
          "contractor_address": "1018 Ferndale st. Stone Mountain, Ga, 30083",
          "license_number": "EN215292",
          "project_size": "6.000 Kwh",
          "per_watt_cost": "$0.30",
          "total_cost": "$1800.00",
          "panel_quantity": "15",
          "inverter_type": "Solar Edge",
          "inverter_quantity": "1"
        }',
        true,
        true,
        ${user.id}
      ) ON CONFLICT DO NOTHING;
    `;

    // Also add it as a sample document
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
      ) VALUES (
        ${org.id}, 
        'eko_solar_installation_agreement.pdf', 
        'Solar Installation Agreement - EKO Solar.pdf', 
        '/templates/eko_solar_agreement.pdf', 
        125000, 
        'application/pdf', 
        'pdf', 
        'contract', 
        'EKO Solar Installation Agreement - A1 Roofing', 
        'Solar installation contract for A1 Roofing at 6326 Albright Dr, Columbus GA - $1,800 for 6kW system', 
        ${user.id}, 
        'active'
      ) ON CONFLICT DO NOTHING;
    `;

    console.log('✅ EKO Solar contract template added successfully!');

    await sql.end();
    console.log('🎉 Template seeding completed!');

  } catch (error) {
    console.error('❌ Template seeding failed:', error);
    await sql.end();
    process.exit(1);
  }
}

seedEkoSolarContract();
