import { pgTable, text, varchar, timestamp, integer, json, boolean, pgEnum, serial } from 'drizzle-orm/pg-core';

// Users and Organizations tables are already defined in schema.sql
// These are defined here for reference and type safety

export const organizations = pgTable('organizations', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  slug: varchar('slug'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  organizationId: varchar('organization_id')
    .notNull()
    .references(() => organizations.id),
  organizationName: varchar('organization_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});