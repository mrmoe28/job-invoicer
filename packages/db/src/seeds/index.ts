import { db } from '../index';
import { users, companies, contacts, jobs, tasks } from '../schema';
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
    }

    // Create admin user (required for authentication)
    console.log('👤 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      email: 'admin@pulsecrm.local',
      passwordHash: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    }).returning();

    console.log('✅ Admin user created successfully');
    console.log('🎉 Database seeding completed!');

    return {
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
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}