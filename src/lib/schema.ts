import { pgTable, text, timestamp, boolean, real, integer, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  company: text('company'),
  phone: text('phone'),
  role: text('role').notNull().default('user'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Password reset functionality
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),

  // Profile data
  firstName: text('first_name'),
  lastName: text('last_name'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
});
export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  contactPerson: text('contact_person'),
  customerType: text('customer_type').notNull().default('residential'),
  notifyByEmail: boolean('notify_by_email').notNull().default(true),
  notifyBySmsText: boolean('notify_by_sms_text').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Foreign keys
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  invoiceId: text('invoice_id').notNull().unique(),
  customerName: text('customer_name').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  status: text('status').notNull().default('Pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Foreign keys
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
});
export const appointments = pgTable('appointments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  customer: text('customer').notNull(),
  customerEmail: text('customer_email'),
  type: text('type').notNull().default('Installation'),
  date: timestamp('date').notNull(),
  time: text('time').notNull(),
  duration: text('duration'),
  location: text('location'),
  status: text('status').notNull().default('Scheduled'),
  priority: text('priority').notNull().default('Medium'),
  notes: text('notes'),
  estimatedValue: real('estimated_value'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Foreign keys
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  invoiceId: text('invoice_id'),
  invoiceNumber: text('invoice_number'),
  customerName: text('customer_name').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('Pending'),
  paymentDate: timestamp('payment_date'),
  paymentMethod: text('payment_method'),
  stripePaymentId: text('stripe_payment_id'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Foreign keys
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
});
export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  location: text('location'),
  source: text('source').notNull().default('Website'),
  status: text('status').notNull().default('New'),
  score: integer('score').notNull().default(0),
  estimatedValue: real('estimated_value').notNull().default(0),
  probability: integer('probability').notNull().default(0),
  assignedTo: text('assigned_to'),
  createdDate: text('created_date').notNull(),
  lastContact: text('last_contact'),
  nextFollowUp: text('next_follow_up'),
  notes: text('notes'),
  tags: text('tags').notNull().default('[]'),
  interests: text('interests').notNull().default('[]'),
  priority: text('priority').notNull().default('Medium'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Foreign keys
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// DocuSign Clone Tables
export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').notNull().default('draft'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signers = pgTable('signers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  order: integer('order').notNull().default(1),
  status: text('status').notNull().default('pending'),
  signedAt: timestamp('signed_at'),
  signatureData: text('signature_data'),
  ipAddress: text('ip_address'),
  emailToken: text('email_token').unique(),
  tokenExpiry: timestamp('token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signatureFields = pgTable('signature_fields', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  signerId: text('signer_id').notNull().references(() => signers.id, { onDelete: 'cascade' }),
  page: integer('page').notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  type: text('type').notNull().default('signature'),
  value: text('value'),
  required: boolean('required').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  signerId: text('signer_id').references(() => signers.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export all tables for easy access
export const schema = {
  users,
  customers,
  invoices,
  appointments,
  payments,
  leads,
  documents,
  signers,
  signatureFields,
  auditLogs,
};