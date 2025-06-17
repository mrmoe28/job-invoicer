import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db, users, companies, contacts, jobs, tasks } from '@pulsecrm/db';
import { eq, desc, and } from 'drizzle-orm';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  // Test procedures
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}! Database is connected.`;
    }),

  // User procedures
  getUsers: publicProcedure.query(async () => {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }),

  // Company procedures
  getCompanies: publicProcedure.query(async () => {
    return await db.select().from(companies).where(eq(companies.isActive, true)).orderBy(desc(companies.createdAt));
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
      const [company] = await db.insert(companies).values(input).returning();
      return company;
    }),

  // Contact procedures  
  getContacts: publicProcedure
    .input(z.object({
      companyId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(contacts.isActive, true)];
      
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
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
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
      const [contact] = await db.insert(contacts).values(input).returning();
      return contact;
    }),

  // Job procedures
  getJobs: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      companyId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(jobs.isActive, true)];
      
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
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(jobs.createdAt));
    }),

  getJobById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [job] = await db.select().from(jobs).where(eq(jobs.id, input.id));
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
      // Generate job number
      const today = new Date();
      const year = today.getFullYear();
      const jobCount = await db.select().from(jobs);
      const jobNumber = `JOB-${year}-${String(jobCount.length + 1).padStart(3, '0')}`;

      const jobData: any = {
        ...input,
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
      const [job] = await db
        .update(jobs)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(jobs.id, input.id))
        .returning();
      return job;
    }),

  // Task procedures
  getTasks: publicProcedure
    .input(z.object({
      jobId: z.string().optional(),
      assignedUserId: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [eq(tasks.isActive, true)];
      
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
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
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
      const taskData: any = {
        ...input,
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
        .where(eq(tasks.id, input.id))
        .returning();
      return task;
    }),

  // Dashboard procedures
  getDashboardStats: publicProcedure.query(async () => {
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
      db.select().from(users).where(eq(users.isActive, true)),
      db.select().from(companies).where(eq(companies.isActive, true)),
      db.select().from(contacts).where(eq(contacts.isActive, true)),
      db.select().from(jobs).where(eq(jobs.isActive, true)),
      db.select().from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.status, 'in_progress'))),
      db.select().from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.status, 'completed'))),
      db.select().from(tasks).where(and(eq(tasks.isActive, true), eq(tasks.status, 'pending'))),
      db.select().from(tasks).where(and(eq(tasks.isActive, true), eq(tasks.status, 'completed'))),
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