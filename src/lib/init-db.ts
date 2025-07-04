import { db } from './drizzle-db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function ensureAdminUser() {
  try {
    // Check if admin user exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@ekosolar.com'))
      .limit(1);

    if (existingAdmin.length === 0) {
      console.log('Creating default admin user...');
      
      // Create admin user
      const [adminUser] = await db
        .insert(users)
        .values({
          id: nanoid(),
          email: 'admin@ekosolar.com',
          password: '', // No password needed for Stack Auth
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          company: 'EkoSolar',
          role: 'admin',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log('Admin user created:', adminUser.email);
      return adminUser;
    }

    console.log('Admin user already exists');
    return existingAdmin[0];
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    throw error;
  }
}
