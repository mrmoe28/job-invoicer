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

// Organizations table - for multi-tenancy (each company/signup gets their own org)
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // free, pro, enterprise
  status: varchar('status', { length: 50 }).notNull().default('active'),
  maxUsers: integer('max_users').notNull().default(5),
  maxJobs: integer('max_jobs').notNull().default(50),
  maxStorageGb: integer('max_storage_gb').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('organizations_slug_idx').on(table.slug),
  planIdx: index('organizations_plan_idx').on(table.plan),
}));

// Users table - for authentication and user management
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'), // owner, admin, member
  isActive: boolean('is_active').notNull().default(true),
  emailVerifiedAt: timestamp('email_verified_at'),
  invitationToken: varchar('invitation_token', { length: 255 }),
  invitedByUserId: uuid('invited_by_user_id'), // Will add foreign key constraint separately
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  orgIdx: index('users_org_idx').on(table.organizationId),
}));

// Companies table - for client companies (isolated per organization)
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
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
  orgIdx: index('companies_org_idx').on(table.organizationId),
}));

// Contacts table - for individual contacts within companies
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
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
  nameIdx: index('contacts_name_idx').on(table.firstName, table.lastName),
  emailIdx: index('contacts_email_idx').on(table.email),
  companyIdx: index('contacts_company_idx').on(table.companyId),
  orgIdx: index('contacts_org_idx').on(table.organizationId),
}));

// Jobs table - for construction projects/jobs
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobNumber: varchar('job_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  primaryContactId: uuid('primary_contact_id').references(() => contacts.id),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  estimatedStartDate: date('estimated_start_date'),
  estimatedEndDate: date('estimated_end_date'),
  actualStartDate: date('actual_start_date'),
  actualEndDate: date('actual_end_date'),
  estimatedBudget: decimal('estimated_budget', { precision: 12, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
  location: text('location'),
  requirements: text('requirements'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobNumberIdx: index('jobs_job_number_idx').on(table.jobNumber),
  statusIdx: index('jobs_status_idx').on(table.status),
  priorityIdx: index('jobs_priority_idx').on(table.priority),
  companyIdx: index('jobs_company_idx').on(table.companyId),
  assignedIdx: index('jobs_assigned_idx').on(table.assignedUserId),
  orgIdx: index('jobs_org_idx').on(table.organizationId),
}));

// Tasks table - for individual tasks within jobs
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, cancelled
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }),
  actualHours: decimal('actual_hours', { precision: 8, scale: 2 }),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  orderIndex: integer('order_index').notNull().default(0),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  jobIdx: index('tasks_job_idx').on(table.jobId),
  assignedIdx: index('tasks_assigned_idx').on(table.assignedUserId),
  orderIdx: index('tasks_order_idx').on(table.orderIndex),
  orgIdx: index('tasks_org_idx').on(table.organizationId),
}));

// Define relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  companies: many(companies),
  contacts: many(contacts),
  jobs: many(jobs),
  tasks: many(tasks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  invitedBy: one(users, {
    fields: [users.invitedByUserId],
    references: [users.id],
  }),
  assignedJobs: many(jobs),
  assignedTasks: many(tasks),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [companies.organizationId],
    references: [organizations.id],
  }),
  contacts: many(contacts),
  jobs: many(jobs),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  primaryJobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobs.organizationId],
    references: [organizations.id],
  }),
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
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [tasks.jobId],
    references: [jobs.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedUserId],
    references: [users.id],
  }),
}));