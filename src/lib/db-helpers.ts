import { db } from './db';
import { users, customers, invoices } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Database query helpers
export const dbHelpers = {
  // User operations
  users: {
    create: async (data: typeof users.$inferInsert) => {
      const [user] = await db.insert(users).values(data).returning();
      return user;
    },

    findByEmail: async (email: string) => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    },

    findById: async (id: string) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    },

    update: async (id: string, data: Partial<typeof users.$inferInsert>) => {
      const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return user;
    },
  },
  // Customer operations
  customers: {
    create: async (data: typeof customers.$inferInsert) => {
      const [customer] = await db.insert(customers).values(data).returning();
      return customer;
    },

    findByUserId: async (userId: string) => {
      return db.select().from(customers).where(eq(customers.userId, userId));
    },

    findById: async (id: string) => {
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      return customer;
    },

    update: async (id: string, data: Partial<typeof customers.$inferInsert>) => {
      const [customer] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
      return customer;
    },

    delete: async (id: string) => {
      await db.delete(customers).where(eq(customers.id, id));
    },
  },
  // Invoice operations
  invoices: {
    create: async (data: typeof invoices.$inferInsert) => {
      const [invoice] = await db.insert(invoices).values(data).returning();
      return invoice;
    },

    findByUserId: async (userId: string) => {
      return db.select().from(invoices).where(eq(invoices.userId, userId));
    },

    findById: async (id: string) => {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
      return invoice;
    },

    update: async (id: string, data: Partial<typeof invoices.$inferInsert>) => {
      const [invoice] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
      return invoice;
    },
  },

  // Add more helpers as needed...
};