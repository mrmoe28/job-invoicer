#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Database connection
const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_VhLHQJNKyW51@ep-floral-frog-a8pl2blz-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createTables() {
  console.log('🔄 Connecting to Neon PostgreSQL database...');
  
  const sql = postgres(connectionString);
  const db = drizzle(sql);

  try {
    console.log('🏗️ Creating database tables...');

    // Create organizations table
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name varchar(255) NOT NULL,
        slug varchar(100) NOT NULL UNIQUE,
        plan varchar(50) NOT NULL DEFAULT 'free',
        status varchar(50) NOT NULL DEFAULT 'active',
        max_users integer NOT NULL DEFAULT 5,
        max_jobs integer NOT NULL DEFAULT 50,
        max_storage_gb integer NOT NULL DEFAULT 1,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        role varchar(50) NOT NULL DEFAULT 'member',
        is_active boolean NOT NULL DEFAULT true,
        email_verified_at timestamp,
        invitation_token varchar(255),
        invited_by_user_id uuid,
        last_login_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create companies table
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        name varchar(255) NOT NULL,
        industry varchar(100),
        website varchar(255),
        address text,
        city varchar(100),
        state varchar(50),
        zip_code varchar(20),
        country varchar(100) DEFAULT 'US',
        phone varchar(50),
        email varchar(255),
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        company_id uuid REFERENCES companies(id) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        title varchar(100),
        email varchar(255),
        phone varchar(50),
        mobile varchar(50),
        is_primary boolean NOT NULL DEFAULT false,
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        job_number varchar(50) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        company_id uuid REFERENCES companies(id) NOT NULL,
        primary_contact_id uuid REFERENCES contacts(id),
        assigned_user_id uuid REFERENCES users(id),
        status varchar(50) NOT NULL DEFAULT 'quoted',
        priority varchar(50) NOT NULL DEFAULT 'medium',
        estimated_start_date date,
        estimated_end_date date,
        actual_start_date date,
        actual_end_date date,
        estimated_budget decimal(12,2),
        actual_cost decimal(12,2),
        location text,
        requirements text,
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        job_id uuid REFERENCES jobs(id) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        assigned_user_id uuid REFERENCES users(id),
        status varchar(50) NOT NULL DEFAULT 'pending',
        priority varchar(50) NOT NULL DEFAULT 'medium',
        estimated_hours decimal(8,2),
        actual_hours decimal(8,2),
        due_date date,
        completed_at timestamp,
        order_index integer NOT NULL DEFAULT 0,
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create documents table
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        job_id uuid REFERENCES jobs(id),
        contact_id uuid REFERENCES contacts(id),
        file_name varchar(255) NOT NULL,
        original_file_name varchar(255) NOT NULL,
        file_path varchar(500) NOT NULL,
        file_size integer NOT NULL,
        mime_type varchar(100) NOT NULL,
        file_type varchar(50) NOT NULL,
        category varchar(100),
        title varchar(255),
        description text,
        uploaded_by_user_id uuid REFERENCES users(id) NOT NULL,
        status varchar(50) NOT NULL DEFAULT 'active',
        tags jsonb,
        metadata jsonb,
        is_public boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create contractors table
    await sql`
      CREATE TABLE IF NOT EXISTS contractors (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        user_id uuid REFERENCES users(id),
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        company_name varchar(255),
        business_type varchar(100),
        license_number varchar(100),
        insurance_provider varchar(255),
        insurance_policy_number varchar(100),
        insurance_expiration_date date,
        bonding_company varchar(255),
        bond_amount decimal(12,2),
        email varchar(255),
        phone varchar(50),
        mobile varchar(50),
        fax varchar(50),
        website varchar(255),
        address text,
        city varchar(100),
        state varchar(50),
        zip_code varchar(20),
        country varchar(100) DEFAULT 'US',
        skills jsonb,
        specialties jsonb,
        hourly_rate decimal(8,2),
        day_rate decimal(10,2),
        overtime_rate decimal(8,2),
        payment_terms varchar(100),
        tax_id varchar(50),
        w9_on_file boolean NOT NULL DEFAULT false,
        emergency_contact jsonb,
        contract_start_date date,
        contract_end_date date,
        status varchar(50) NOT NULL DEFAULT 'active',
        rating decimal(3,2),
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create document signatures table for e-signature functionality
    await sql`
      CREATE TABLE IF NOT EXISTS document_signatures (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        document_id uuid REFERENCES documents(id) NOT NULL,
        signer_id uuid REFERENCES users(id),
        signer_name varchar(255) NOT NULL,
        signer_email varchar(255) NOT NULL,
        signer_role varchar(100),
        signature_data text,
        signature_type varchar(50) NOT NULL DEFAULT 'draw',
        ip_address varchar(45),
        user_agent text,
        status varchar(50) NOT NULL DEFAULT 'pending',
        signed_at timestamp,
        expired_at timestamp,
        declined_at timestamp,
        decline_reason text,
        verification_code varchar(10),
        is_email_sent boolean NOT NULL DEFAULT false,
        email_sent_at timestamp,
        reminders_sent integer NOT NULL DEFAULT 0,
        last_reminder_at timestamp,
        signature_position jsonb,
        notes text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create document templates table
    await sql`
      CREATE TABLE IF NOT EXISTS document_templates (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id uuid REFERENCES organizations(id) NOT NULL,
        name varchar(255) NOT NULL,
        description text,
        category varchar(100),
        template_type varchar(50) NOT NULL DEFAULT 'pdf',
        template_data text,
        file_path varchar(500),
        signature_fields jsonb,
        variables jsonb,
        is_default boolean NOT NULL DEFAULT false,
        is_active boolean NOT NULL DEFAULT true,
        created_by_user_id uuid REFERENCES users(id) NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug);`;
    await sql`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS users_org_idx ON users(organization_id);`;
    await sql`CREATE INDEX IF NOT EXISTS companies_name_idx ON companies(name);`;
    await sql`CREATE INDEX IF NOT EXISTS companies_org_idx ON companies(organization_id);`;
    await sql`CREATE INDEX IF NOT EXISTS contacts_name_idx ON contacts(first_name, last_name);`;
    await sql`CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts(company_id);`;
    await sql`CREATE INDEX IF NOT EXISTS jobs_job_number_idx ON jobs(job_number);`;
    await sql`CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);`;
    await sql`CREATE INDEX IF NOT EXISTS tasks_job_idx ON tasks(job_id);`;
    await sql`CREATE INDEX IF NOT EXISTS documents_file_name_idx ON documents(file_name);`;
    await sql`CREATE INDEX IF NOT EXISTS documents_job_idx ON documents(job_id);`;
    await sql`CREATE INDEX IF NOT EXISTS contractors_name_idx ON contractors(first_name, last_name);`;
    await sql`CREATE INDEX IF NOT EXISTS contractors_org_idx ON contractors(organization_id);`;
    await sql`CREATE INDEX IF NOT EXISTS document_signatures_document_idx ON document_signatures(document_id);`;
    await sql`CREATE INDEX IF NOT EXISTS document_signatures_status_idx ON document_signatures(status);`;

    console.log('✅ Database tables created successfully!');

    // Insert seed data
    console.log('🌱 Seeding initial data...');

    // Create default organization
    const [org] = await sql`
      INSERT INTO organizations (name, slug, plan, status)
      VALUES ('Pulse Solar CRM', 'pulse-solar', 'pro', 'active')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `;

    if (org) {
      console.log('✅ Default organization created');

      // Create default admin user
      await sql`
        INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
        VALUES (${org.id}, 'admin@pulsecrm.com', '$2a$10$example.hash.for.development', 'Admin', 'User', 'owner')
        ON CONFLICT (email) DO NOTHING;
      `;

      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️ Organization already exists, skipping seed data');
    }

    await sql.end();
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

createTables();
