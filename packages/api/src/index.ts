import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db, organizations, users, companies, contacts, jobs, tasks, hashPassword, verifyPassword, generateToken } from '@pulsecrm/db';
import { eq, desc, and } from 'drizzle-orm';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// For now, we'll use a demo organization ID
// In production, this would come from authentication context
const DEMO_ORG_ID = async () => {
  const org = await db.select().from(organizations).where(eq(organizations.slug, 'demo-construction')).limit(1);
  return org[0]?.id;
};

export const appRouter = router({
  // Authentication procedures
  signup: publicProcedure
    .input(z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      organizationName: z.string().min(1, 'Organization name is required'),
      plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
    }))
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error('Email already registered');
      }

      // Generate unique organization slug
      const baseSlug = input.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      let slug = baseSlug;
      let counter = 1;
      
      // Check if slug exists and increment if needed
      while (true) {
        const existingOrg = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
        if (existingOrg.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create organization first
      const [organization] = await db.insert(organizations).values({
        name: input.organizationName,
        slug,
        plan: input.plan,
        status: 'active',
        maxUsers: input.plan === 'free' ? 5 : input.plan === 'pro' ? 50 : 500,
        maxJobs: input.plan === 'free' ? 50 : input.plan === 'pro' ? 500 : 5000,
        maxStorageGb: input.plan === 'free' ? 1 : input.plan === 'pro' ? 100 : 1000,
      }).returning();

      // Hash password and create user
      const passwordHash = await hashPassword(input.password);
      const [user] = await db.insert(users).values({
        organizationId: organization.id,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: 'owner', // First user is always owner
        emailVerifiedAt: new Date(), // Auto-verify for now, add email verification later
      }).returning();

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          plan: organization.plan,
        },
      };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }))
    .mutation(async ({ input }) => {
      // Find user by email
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        organizationId: users.organizationId,
        lastLoginAt: users.lastLoginAt,
      }).from(users).where(eq(users.email, input.email)).limit(1);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await verifyPassword(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Get organization details
      const [organization] = await db.select().from(organizations)
        .where(eq(organizations.id, user.organizationId)).limit(1);

      if (!organization || organization.status !== 'active') {
        throw new Error('Organization is not active');
      }

      // Update last login time
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          plan: organization.plan,
          status: organization.status,
        },
      };
    }),

  // Check if email is available
  checkEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .query(async ({ input }) => {
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      return {
        available: existingUser.length === 0,
      };
    }),

  // Check if organization slug is available
  checkSlug: publicProcedure
    .input(z.object({
      slug: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const existingOrg = await db.select().from(organizations).where(eq(organizations.slug, input.slug)).limit(1);
      return {
        available: existingOrg.length === 0,
      };
    }),

  // Test procedures
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}! Multi-tenant database is connected.`;
    }),

  // Organization procedures
  getOrganizations: publicProcedure.query(async () => {
    return await db.select().from(organizations).orderBy(desc(organizations.createdAt));
  }),

  // User procedures (organization-scoped)
  getUsers: publicProcedure.query(async () => {
    const orgId = await DEMO_ORG_ID();
    if (!orgId) return [];
    
    return await db.select().from(users)
      .where(eq(users.organizationId, orgId))
      .orderBy(desc(users.createdAt));
  }),

  // Company procedures (organization-scoped)
  getCompanies: publicProcedure.query(async () => {
    const orgId = await DEMO_ORG_ID();
    if (!orgId) return [];
    
    return await db.select().from(companies)
      .where(and(
        eq(companies.organizationId, orgId),
        eq(companies.isActive, true)
      ))
      .orderBy(desc(companies.createdAt));
  }),

  createCompany: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      website: z.string().url().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      const [company] = await db.insert(companies).values({
        ...input,
        organizationId: orgId,
      }).returning();
      return company;
    }),

  // Contact procedures (organization-scoped)
  getContacts: publicProcedure
    .input(z.object({
      companyId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) return [];
      
      const conditions = [
        eq(contacts.organizationId, orgId),
        eq(contacts.isActive, true)
      ];
      
      if (input.companyId) {
        conditions.push(eq(contacts.companyId, input.companyId));
      }

      return await db.select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        title: contacts.title,
        email: contacts.email,
        phone: contacts.phone,
        mobile: contacts.mobile,
        isPrimary: contacts.isPrimary,
        companyId: contacts.companyId,
        companyName: companies.name,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(desc(contacts.createdAt));
    }),

  createContact: publicProcedure
    .input(z.object({
      companyId: z.string(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      title: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      isPrimary: z.boolean().default(false),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      const [contact] = await db.insert(contacts).values({
        ...input,
        organizationId: orgId,
      }).returning();
      return contact;
    }),

  // Job procedures (organization-scoped)
  getJobs: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      companyId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) return [];
      
      const conditions = [
        eq(jobs.organizationId, orgId),
        eq(jobs.isActive, true)
      ];
      
      if (input.status) {
        conditions.push(eq(jobs.status, input.status));
      }

      if (input.companyId) {
        conditions.push(eq(jobs.companyId, input.companyId));
      }

      return await db.select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        status: jobs.status,
        priority: jobs.priority,
        estimatedStartDate: jobs.estimatedStartDate,
        estimatedEndDate: jobs.estimatedEndDate,
        estimatedBudget: jobs.estimatedBudget,
        location: jobs.location,
        companyName: companies.name,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));
    }),

  getJobById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) return null;

      const [job] = await db.select().from(jobs)
        .where(and(
          eq(jobs.id, input.id),
          eq(jobs.organizationId, orgId)
        ));
      return job;
    }),

  createJob: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      companyId: z.string(),
      primaryContactId: z.string().optional(),
      assignedUserId: z.string().optional(),
      status: z.string().default('quoted'),
      priority: z.string().default('medium'),
      estimatedStartDate: z.string().optional(),
      estimatedEndDate: z.string().optional(),
      estimatedBudget: z.string().optional(),
      location: z.string().optional(),
      requirements: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      // Generate job number
      const today = new Date();
      const year = today.getFullYear();
      const existingJobs = await db.select().from(jobs).where(eq(jobs.organizationId, orgId));
      const jobNumber = `JOB-${year}-${String(existingJobs.length + 1).padStart(3, '0')}`;

      const jobData: any = {
        ...input,
        organizationId: orgId,
        jobNumber,
      };

      if (input.estimatedStartDate) {
        jobData.estimatedStartDate = new Date(input.estimatedStartDate);
      }
      if (input.estimatedEndDate) {
        jobData.estimatedEndDate = new Date(input.estimatedEndDate);
      }

      const [job] = await db.insert(jobs).values(jobData).returning();
      return job;
    }),

  updateJobStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      const [job] = await db
        .update(jobs)
        .set({ status: input.status, updatedAt: new Date() })
        .where(and(
          eq(jobs.id, input.id),
          eq(jobs.organizationId, orgId)
        ))
        .returning();
      return job;
    }),

  // Task procedures (organization-scoped)
  getTasks: publicProcedure
    .input(z.object({
      jobId: z.string().optional(),
      assignedUserId: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) return [];
      
      const conditions = [
        eq(tasks.organizationId, orgId),
        eq(tasks.isActive, true)
      ];
      
      if (input.jobId) {
        conditions.push(eq(tasks.jobId, input.jobId));
      }

      if (input.assignedUserId) {
        conditions.push(eq(tasks.assignedUserId, input.assignedUserId));
      }

      if (input.status) {
        conditions.push(eq(tasks.status, input.status));
      }

      return await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        jobId: tasks.jobId,
        jobTitle: jobs.title,
        orderIndex: tasks.orderIndex,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(jobs, eq(tasks.jobId, jobs.id))
      .leftJoin(users, eq(tasks.assignedUserId, users.id))
      .where(and(...conditions))
      .orderBy(tasks.orderIndex, desc(tasks.createdAt));
    }),

  createTask: publicProcedure
    .input(z.object({
      jobId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      assignedUserId: z.string().optional(),
      priority: z.string().default('medium'),
      estimatedHours: z.string().optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      const taskData: any = {
        ...input,
        organizationId: orgId,
      };

      if (input.dueDate) {
        taskData.dueDate = new Date(input.dueDate);
      }

      const [task] = await db.insert(tasks).values(taskData).returning();
      return task;
    }),

  updateTaskStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      const orgId = await DEMO_ORG_ID();
      if (!orgId) throw new Error('Organization not found');

      const updateData: any = { 
        status: input.status, 
        updatedAt: new Date() 
      };
      
      if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }

      const [task] = await db
        .update(tasks)
        .set(updateData)
        .where(and(
          eq(tasks.id, input.id),
          eq(tasks.organizationId, orgId)
        ))
        .returning();
      return task;
    }),

  // Dashboard procedures (organization-scoped)
  getDashboardStats: publicProcedure.query(async () => {
    const orgId = await DEMO_ORG_ID();
    if (!orgId) return {
      totalUsers: 0,
      totalCompanies: 0,
      totalContacts: 0,
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      pendingTasks: 0,
      completedTasks: 0,
      completionRate: 0,
    };

    const [
      totalUsers,
      totalCompanies,
      totalContacts,
      totalJobs,
      activeJobs,
      completedJobs,
      pendingTasks,
      completedTasks,
    ] = await Promise.all([
      db.select().from(users).where(and(eq(users.organizationId, orgId), eq(users.isActive, true))),
      db.select().from(companies).where(and(eq(companies.organizationId, orgId), eq(companies.isActive, true))),
      db.select().from(contacts).where(and(eq(contacts.organizationId, orgId), eq(contacts.isActive, true))),
      db.select().from(jobs).where(and(eq(jobs.organizationId, orgId), eq(jobs.isActive, true))),
      db.select().from(jobs).where(and(eq(jobs.organizationId, orgId), eq(jobs.isActive, true), eq(jobs.status, 'in_progress'))),
      db.select().from(jobs).where(and(eq(jobs.organizationId, orgId), eq(jobs.isActive, true), eq(jobs.status, 'completed'))),
      db.select().from(tasks).where(and(eq(tasks.organizationId, orgId), eq(tasks.isActive, true), eq(tasks.status, 'pending'))),
      db.select().from(tasks).where(and(eq(tasks.organizationId, orgId), eq(tasks.isActive, true), eq(tasks.status, 'completed'))),
    ]);

    return {
      totalUsers: totalUsers.length,
      totalCompanies: totalCompanies.length,
      totalContacts: totalContacts.length,
      totalJobs: totalJobs.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      pendingTasks: pendingTasks.length,
      completedTasks: completedTasks.length,
      completionRate: totalJobs.length > 0 ? completedJobs.length / totalJobs.length : 0,
    };
  }),
});

export type AppRouter = typeof appRouter;