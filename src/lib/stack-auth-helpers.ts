import { stackServerApp } from '@/stack';
import { db } from './drizzle-db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types for Stack Auth user
interface StackAuthUser {
    id: string;
    primaryEmail: string;
    displayName?: string;
    primaryEmailVerified?: boolean;
    primaryEmailAuth?: {
        firstName?: string;
        lastName?: string;
    };
}

interface UserProfileUpdate {
    name?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

// Get the current user from Stack Auth
export async function getCurrentUser() {
    try {
        if (!stackServerApp) {
            console.error('Stack Auth not initialized');
            return null;
        }

        const user = await stackServerApp.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Create or update user in our database based on Stack Auth user
export async function syncUserWithDatabase(stackUser: StackAuthUser) {
    try {
        // Check if user already exists in our database
        const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, stackUser.primaryEmail))
            .limit(1);

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            // Update existing user with any new information
            const [updatedUser] = await db
                .update(users)
                .set({
                    name: stackUser.displayName || existingUser.name,
                    firstName: stackUser.primaryEmailAuth?.firstName || existingUser.firstName,
                    lastName: stackUser.primaryEmailAuth?.lastName || existingUser.lastName,
                    isVerified: stackUser.primaryEmailVerified || existingUser.isVerified,
                    updatedAt: new Date()
                })
                .where(eq(users.email, stackUser.primaryEmail))
                .returning();
            return updatedUser;
        } else {
            // Create new user in our database
            const [newUser] = await db
                .insert(users)
                .values({
                    id: nanoid(), // Generate unique ID
                    email: stackUser.primaryEmail,
                    password: '', // Stack Auth handles password, we just store empty string
                    name: stackUser.displayName || stackUser.primaryEmail.split('@')[0],
                    firstName: stackUser.primaryEmailAuth?.firstName || '',
                    lastName: stackUser.primaryEmailAuth?.lastName || '',
                    isVerified: stackUser.primaryEmailVerified || false,
                    role: 'user', // Default role
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();
            return newUser;
        }
    } catch (error) {
        console.error('Error syncing user with database:', error);
        throw error;
    }
}

// Get user from our database by email
export async function getUserFromDatabase(email: string) {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return result[0] || null;
    } catch (error) {
        console.error('Error getting user from database:', error);
        return null;
    }
}

// Get authenticated user for API routes
export async function getAuthenticatedUser() {
    try {
        // First, try to get Stack Auth user
        const stackUser = await getCurrentUser();

        if (stackUser) {
            // Sync Stack Auth user with our database
            const dbUser = await syncUserWithDatabase(stackUser as StackAuthUser);

            return {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                isVerified: dbUser.isVerified,
                stackUser: stackUser
            };
        }

        // If Stack Auth is not available, use the default admin user
        console.log('Stack Auth not available, using default admin user');
        const defaultUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, 'admin@ekosolar.com'))
            .limit(1);

        if (defaultUsers.length === 0) {
            console.log('Default admin user not found, creating one...');
            // Create default admin user if it doesn't exist
            const [newUser] = await db
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
            return {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name || '',
                role: newUser.role,
                isVerified: newUser.isVerified,
                stackUser: null
            };
        }

        const defaultUser = defaultUsers[0];
        return {
            id: defaultUser.id,
            email: defaultUser.email,
            name: defaultUser.name || '',
            role: defaultUser.role,
            isVerified: defaultUser.isVerified,
            stackUser: null
        };
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        
        // As a last resort, return a temporary user for development
        console.log('Using temporary user for development');
        return {
            id: 'temp-user-id',
            email: 'temp@example.com',
            name: 'Temporary User',
            role: 'user',
            isVerified: true,
            stackUser: null
        };
    }
}

// Cleanup function (no-op for Drizzle)
export async function disconnectPrisma() {
    // No-op for Drizzle - connection pooling is handled automatically
}

// Get user by ID from our database
export async function getUserById(userId: string) {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        return result[0] || null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

// Update user profile in our database
export async function updateUserProfile(userId: string, data: UserProfileUpdate) {
    try {
        const [updatedUser] = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Delete user from our database
export async function deleteUser(userId: string) {
    try {
        await db
            .delete(users)
            .where(eq(users.id, userId));
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
} 