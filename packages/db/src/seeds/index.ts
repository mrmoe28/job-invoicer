import { db } from '../index';
import { users, organizations, companies, contacts, jobs, tasks } from '../schema';
import { hashPassword } from '../utils/auth';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await db.delete(tasks);
      await db.delete(jobs);
      await db.delete(contacts);
      await db.delete(companies);
      await db.delete(users);
      await db.delete(organizations);
    }

    // Create demo organization (for admin user)
    console.log('🏢 Creating demo organization...');
    const [demoOrg] = await db.insert(organizations).values({
      name: 'Demo Construction Company',
      slug: 'demo-construction',
      plan: 'pro',
      status: 'active',
    }).returning();

    // Create admin user (required for authentication)
    console.log('👤 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      organizationId: demoOrg.id,
      email: 'admin@pulsecrm.local',
      passwordHash: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'owner',
      emailVerifiedAt: new Date(),
    }).returning();

    console.log('✅ Demo organization and admin user created successfully');
    console.log('🎉 Database seeding completed!');

    return {
      organizations: { demoOrg },
      users: { adminUser },
      companies: {},
      contacts: {},
      jobs: {},
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Utility function to reset database
export async function resetDatabase() {
  console.log('🗑️ Resetting database...');
  
  try {
    await db.delete(tasks);
    await db.delete(jobs);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);
    await db.delete(organizations);
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}