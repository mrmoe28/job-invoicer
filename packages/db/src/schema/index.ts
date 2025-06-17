import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  varchar, 
  decimal,
  integer,
  boolean,
  uuid,
  date,
  jsonb,
  index,
  foreignKey,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - for authentication and user management
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // admin, manager, user, crew
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Companies table - for client companies
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('US'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('companies_name_idx').on(table.name),
  industryIdx: index('companies_industry_idx').on(table.industry),
}));

// Contacts table - individual contacts within companies
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').references(() => companies.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  title: varchar('title', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  mobile: varchar('mobile', { length: 50 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('contacts_company_id_idx').on(table.companyId),
  emailIdx: index('contacts_email_idx').on(table.email),
  nameIdx: index('contacts_name_idx').on(table.firstName, table.lastName),
}));

// Jobs table - main project/job management
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobNumber: varchar('job_number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  primaryContactId: uuid('primary_contact_id').references(() => contacts.id),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled, on_hold
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // low, medium, high, urgent
  estimatedStartDate: date('estimated_start_date'),
  estimatedEndDate: date('estimated_end_date'),
  actualStartDate: date('actual_start_date'),
  actualEndDate: date('actual_end_date'),
  estimatedBudget: decimal('estimated_budget', { precision: 12, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
  location: text('location'),
  requirements: text('requirements'),
  notes: text('notes'),
  metadata: jsonb('metadata'), // For flexible additional data
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobNumberIdx: index('jobs_job_number_idx').on(table.jobNumber),
  companyIdx: index('jobs_company_id_idx').on(table.companyId),
  statusIdx: index('jobs_status_idx').on(table.status),
  priorityIdx: index('jobs_priority_idx').on(table.priority),
  assignedUserIdx: index('jobs_assigned_user_id_idx').on(table.assignedUserId),
  startDateIdx: index('jobs_start_date_idx').on(table.estimatedStartDate),
}));

// Tasks table - individual tasks within jobs
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, cancelled
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
  actualHours: decimal('actual_hours', { precision: 6, scale: 2 }),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobIdx: index('tasks_job_id_idx').on(table.jobId),
  statusIdx: index('tasks_status_idx').on(table.status),
  assignedUserIdx: index('tasks_assigned_user_id_idx').on(table.assignedUserId),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
  orderIdx: index('tasks_order_idx').on(table.jobId, table.orderIndex),
}));

// Documents table - file management
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id),
  uploadedByUserId: uuid('uploaded_by_user_id').notNull().references(() => users.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  category: varchar('category', { length: 100 }), // contract, invoice, photo, plan, etc.
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  version: integer('version').notNull().default(1),
  parentDocumentId: uuid('parent_document_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobIdx: index('documents_job_id_idx').on(table.jobId),
  companyIdx: index('documents_company_id_idx').on(table.companyId),
  categoryIdx: index('documents_category_idx').on(table.category),
  uploadedByIdx: index('documents_uploaded_by_idx').on(table.uploadedByUserId),
}));

// Time tracking table
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  jobId: uuid('job_id').references(() => jobs.id),
  taskId: uuid('task_id').references(() => tasks.id),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // in minutes
  hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('time_entries_user_id_idx').on(table.userId),
  jobIdx: index('time_entries_job_id_idx').on(table.jobId),
  taskIdx: index('time_entries_task_id_idx').on(table.taskId),
  startTimeIdx: index('time_entries_start_time_idx').on(table.startTime),
}));

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, sent, paid, overdue, cancelled
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  invoiceNumberIdx: index('invoices_invoice_number_idx').on(table.invoiceNumber),
  jobIdx: index('invoices_job_id_idx').on(table.jobId),
  companyIdx: index('invoices_company_id_idx').on(table.companyId),
  statusIdx: index('invoices_status_idx').on(table.status),
  dueDateIdx: index('invoices_due_date_idx').on(table.dueDate),
}));

// Activity log for audit trail
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // job, task, contact, etc.
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // created, updated, deleted, etc.
  changes: jsonb('changes'), // What changed
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('activity_log_user_id_idx').on(table.userId),
  entityIdx: index('activity_log_entity_idx').on(table.entityType, table.entityId),
  actionIdx: index('activity_log_action_idx').on(table.action),
  createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
}));// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  assignedJobs: many(jobs),
  assignedTasks: many(tasks),
  timeEntries: many(timeEntries),
  uploadedDocuments: many(documents),
  activityLogs: many(activityLog),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  jobs: many(jobs),
  documents: many(documents),
  invoices: many(invoices),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  primaryContactJobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  primaryContact: one(contacts, {
    fields: [jobs.primaryContactId],
    references: [contacts.id],
  }),
  assignedUser: one(users, {
    fields: [jobs.assignedUserId],
    references: [users.id],
  }),
  tasks: many(tasks),
  documents: many(documents),
  timeEntries: many(timeEntries),
  invoices: many(invoices),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  job: one(jobs, {
    fields: [tasks.jobId],
    references: [jobs.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedUserId],
    references: [users.id],
  }),
  timeEntries: many(timeEntries),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  job: one(jobs, {
    fields: [documents.jobId],
    references: [jobs.id],
  }),
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedByUserId],
    references: [users.id],
  }),
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
    relationName: "parentDocument"
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [timeEntries.jobId],
    references: [jobs.id],
  }),
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  job: one(jobs, {
    fields: [invoices.jobId],
    references: [jobs.id],
  }),
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// Tables are already exported above with their definitions