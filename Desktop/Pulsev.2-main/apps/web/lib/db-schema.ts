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

// Document system tables
export const documents = pgTable('documents', {
  id: varchar('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: text('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  organizationId: varchar('organization_id')
    .notNull()
    .references(() => organizations.id),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Document status enum
export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'pending_signature',
  'signed',
  'rejected',
  'expired',
]);

// Document signatures table
export const documentSignatures = pgTable('document_signatures', {
  id: varchar('id').primaryKey(),
  documentId: varchar('document_id')
    .notNull()
    .references(() => documents.id),
  signerEmail: varchar('signer_email').notNull(),
  signerName: varchar('signer_name').notNull(),
  status: documentStatusEnum('status').notNull().default('pending_signature'),
  signedAt: timestamp('signed_at'),
  expiresAt: timestamp('expires_at'),
  signatureData: json('signature_data'),
  accessToken: varchar('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Signature positions for documents
export const signaturePositions = pgTable('signature_positions', {
  id: serial('id').primaryKey(),
  documentId: varchar('document_id')
    .notNull()
    .references(() => documents.id),
  signatureId: varchar('signature_id')
    .references(() => documentSignatures.id),
  page: integer('page').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  width: integer('width').notNull().default(200),
  height: integer('height').notNull().default(50),
  required: boolean('required').notNull().default(true),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
