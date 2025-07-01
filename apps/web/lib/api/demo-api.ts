// Standalone demo API for ConstructFlow/PulseCRM
// This provides working CRUD functionality with demo data for immediate deployment

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Demo organization ID
const DEMO_ORG_ID = 'demo-org-1';

// In-memory demo data (simulating database)
let demoData = {
  // Organizations
  organizations: [
    {
      id: DEMO_ORG_ID,
      name: 'ConstructFlow Demo',
      slug: 'constructflow-demo',
      plan: 'pro',
      status: 'active',
      maxUsers: 50,
      maxJobs: 1000,
      maxStorageGb: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Users
  users: [
    {
      id: 'user-1',
      organizationId: DEMO_ORG_ID,
      email: 'admin@constructflow.com',
      passwordHash: 'hashed-password',
      firstName: 'Admin',
      lastName: 'User',
      role: 'owner',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Companies  companies: [
    {
      id: 'company-1',
      organizationId: DEMO_ORG_ID,
      name: 'Sunrise Construction',
      industry: 'Construction',
      address: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'US',
      phone: '(555) 123-4567',
      email: 'info@sunriseconstruction.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'company-2',
      organizationId: DEMO_ORG_ID,
      name: 'Metro Builders LLC',
      industry: 'Construction',
      address: '456 Oak Ave',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30318',
      country: 'US',
      phone: '(555) 987-6543',
      email: 'contact@metrobuilders.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Contacts
  contacts: [
    {
      id: 'contact-1',
      organizationId: DEMO_ORG_ID,
      companyId: 'company-1',
      firstName: 'John',
      lastName: 'Smith',
      title: 'Project Manager',
      email: 'john.smith@sunriseconstruction.com',
      phone: '(555) 123-4567',
      mobile: '(555) 123-4568',
      isPrimary: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },    {
      id: 'contact-2',
      organizationId: DEMO_ORG_ID,
      companyId: 'company-2',
      firstName: 'Sarah',
      lastName: 'Wilson',
      title: 'Operations Director',
      email: 'sarah.wilson@metrobuilders.com',
      phone: '(555) 987-6543',
      mobile: '(555) 987-6544',
      isPrimary: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Jobs
  jobs: [
    {
      id: 'job-1',
      organizationId: DEMO_ORG_ID,
      jobNumber: 'JOB-2024-001',
      title: 'Office Building Renovation',
      description: 'Complete renovation of 3-story office building including HVAC, electrical, and interior finishes.',
      companyId: 'company-1',
      primaryContactId: 'contact-1',
      assignedUserId: 'user-1',
      status: 'in_progress',
      priority: 'high',
      estimatedStartDate: '2024-07-15',
      estimatedEndDate: '2024-10-15',
      estimatedBudget: 250000,
      location: '123 Business Blvd, Atlanta, GA',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'job-2',
      organizationId: DEMO_ORG_ID,
      jobNumber: 'JOB-2024-002',
      title: 'Residential Complex Foundation',
      description: 'Foundation work for new 12-unit residential complex.',
      companyId: 'company-2',
      primaryContactId: 'contact-2',
      assignedUserId: 'user-1',
      status: 'quoted',
      priority: 'medium',
      estimatedStartDate: '2024-08-01',
      estimatedEndDate: '2024-09-30',
      estimatedBudget: 180000,
      location: '456 Residential Dr, Atlanta, GA',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Tasks
  tasks: [
    {
      id: 'task-1',
      organizationId: DEMO_ORG_ID,
      jobId: 'job-1',
      title: 'HVAC System Installation',
      description: 'Install new HVAC system on floors 2 and 3',
      assignedUserId: 'user-1',
      status: 'in_progress',
      priority: 'high',
      estimatedHours: 40,
      dueDate: '2024-08-15',
      orderIndex: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-2',
      organizationId: DEMO_ORG_ID,
      jobId: 'job-1',
      title: 'Electrical Rough-In',
      description: 'Complete electrical rough-in for all floors',
      assignedUserId: 'user-1',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 32,
      dueDate: '2024-08-20',
      orderIndex: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Documents
  documents: [
    {
      id: 'doc-1',
      organizationId: DEMO_ORG_ID,
      jobId: 'job-1',
      fileName: 'contract-signed.pdf',
      originalFileName: 'Construction Contract - Signed.pdf',
      filePath: '/uploads/contracts/contract-signed.pdf',
      fileSize: 2400000,
      mimeType: 'application/pdf',
      fileType: 'pdf',
      category: 'contract',
      title: 'Signed Construction Contract',
      uploadedByUserId: 'user-1',
      status: 'active',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'doc-2',
      organizationId: DEMO_ORG_ID,
      jobId: 'job-2',
      fileName: 'blueprint-foundation.pdf',
      originalFileName: 'Foundation Blueprint v2.pdf',
      filePath: '/uploads/blueprints/foundation-v2.pdf',
      fileSize: 1800000,
      mimeType: 'application/pdf',
      fileType: 'pdf',
      category: 'blueprint',
      title: 'Foundation Blueprint',
      uploadedByUserId: 'user-1',
      status: 'active',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Crew Members
  crewMembers: [
    {
      id: 'crew-1',
      organizationId: DEMO_ORG_ID,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@constructflow.com',
      phone: '(555) 111-2222',
      skills: '["Electrical", "HVAC", "General Construction"]',
      hourlyRate: 35.00,
      status: 'active',
      hireDate: '2023-03-15',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'crew-2',
      organizationId: DEMO_ORG_ID,
      firstName: 'David',
      lastName: 'Rodriguez',
      email: 'david.rodriguez@constructflow.com',
      phone: '(555) 333-4444',
      skills: '["Plumbing", "General Construction"]',
      hourlyRate: 32.00,
      status: 'active',
      hireDate: '2023-05-20',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  // Job Assignments
  jobAssignments: [
    {
      id: 'assignment-1',
      organizationId: DEMO_ORG_ID,
      jobId: 'job-1',
      crewMemberId: 'crew-1',
      role: 'Lead Electrician',
      assignedDate: '2024-07-15',
      hourlyRate: 35.00,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
};

// Helper functions
function generateId() {
  return crypto.randomUUID();
}

function findByOrgId<T extends { organizationId: string; isActive?: boolean }>(
  data: T[], 
  filters: Record<string, any> = {}
): T[] {
  return data.filter(item => {
    if (item.organizationId !== DEMO_ORG_ID) return false;
    if (item.isActive !== undefined && !item.isActive) return false;
    
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined) return true;
      return (item as any)[key] === value;
    });
  });
}

function findById<T extends { id: string; organizationId: string }>(
  data: T[], 
  id: string
): T | undefined {
  return data.find(item => item.id === id && item.organizationId === DEMO_ORG_ID);
}

function updateById<T extends { id: string; organizationId: string; updatedAt?: Date }>(
  data: T[], 
  id: string, 
  updates: Partial<T>
): T | undefined {
  const index = data.findIndex(item => item.id === id && item.organizationId === DEMO_ORG_ID);
  if (index === -1) return undefined;
  
  data[index] = { 
    ...data[index], 
    ...updates, 
    updatedAt: new Date() 
  };
  return data[index];
}

function createItem<T extends { id?: string; organizationId?: string; createdAt?: Date; updatedAt?: Date }>(
  data: T[], 
  item: T
): T {
  const newItem = {
    ...item,
    id: item.id || generateId(),
    organizationId: DEMO_ORG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  data.push(newItem);
  return newItem;
}

export const appRouter = router({
  // Test endpoint
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}! CRUD operations are now functional with demo data.`;
    }),

  // Dashboard Stats
  getDashboardStats: publicProcedure.query(() => {
    const totalCompanies = findByOrgId(demoData.companies).length;
    const totalContacts = findByOrgId(demoData.contacts).length;
    const totalJobs = findByOrgId(demoData.jobs).length;
    const activeJobs = findByOrgId(demoData.jobs, { status: 'in_progress' }).length;
    const completedJobs = findByOrgId(demoData.jobs, { status: 'completed' }).length;
    const pendingTasks = findByOrgId(demoData.tasks, { status: 'pending' }).length;
    const completedTasks = findByOrgId(demoData.tasks, { status: 'completed' }).length;

    return {
      totalUsers: 1,
      totalCompanies,
      totalContacts,
      totalJobs,
      activeJobs,
      completedJobs,
      pendingTasks,
      completedTasks,
      completionRate: totalJobs > 0 ? completedJobs / totalJobs : 0,
    };
  }),

  // Companies CRUD
  getCompanies: publicProcedure.query(() => {
    return findByOrgId(demoData.companies).map(company => ({
      ...company,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    }));
  }),

  createCompany: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(({ input }) => {
      const company = createItem(demoData.companies, {
        ...input,
        country: 'US',
        isActive: true,
      } as any);
      return company;
    }),

  updateCompany: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      industry: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateById(demoData.companies, id, updates);
    }),

  deleteCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return updateById(demoData.companies, input.id, { isActive: false });
    }),

  // Contacts CRUD
  getContacts: publicProcedure
    .input(z.object({
      companyId: z.string().optional(),
    }))
    .query(({ input }) => {
      const contacts = findByOrgId(demoData.contacts, input.companyId ? { companyId: input.companyId } : {});
      return contacts.map(contact => {
        const company = findById(demoData.companies, contact.companyId);
        return {
          ...contact,
          companyName: company?.name || 'Unknown Company',
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString(),
        };
      });
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
    }))
    .mutation(({ input }) => {
      const contact = createItem(demoData.contacts, {
        ...input,
        isActive: true,
      } as any);
      return contact;
    }),

  updateContact: publicProcedure
    .input(z.object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      title: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateById(demoData.contacts, id, updates);
    }),

  deleteContact: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return updateById(demoData.contacts, input.id, { isActive: false });
    }),

  // Jobs CRUD
  getJobs: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      companyId: z.string().optional(),
    }))
    .query(({ input }) => {
      const filters: any = {};
      if (input.status) filters.status = input.status;
      if (input.companyId) filters.companyId = input.companyId;
      
      const jobs = findByOrgId(demoData.jobs, filters);
      return jobs.map(job => {
        const company = findById(demoData.companies, job.companyId);
        return {
          ...job,
          companyName: company?.name || 'Unknown Company',
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        };
      });
    }),

  createJob: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      companyId: z.string(),
      primaryContactId: z.string().optional(),
      status: z.string().default('quoted'),
      priority: z.string().default('medium'),
      estimatedStartDate: z.string().optional(),
      estimatedEndDate: z.string().optional(),
      estimatedBudget: z.number().optional(),
      location: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const jobNumber = `JOB-${new Date().getFullYear()}-${String(demoData.jobs.length + 1).padStart(3, '0')}`;
      const job = createItem(demoData.jobs, {
        ...input,
        jobNumber,
        assignedUserId: 'user-1',
        isActive: true,
      } as any);
      return job;
    }),

  updateJob: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      estimatedStartDate: z.string().optional(),
      estimatedEndDate: z.string().optional(),
      estimatedBudget: z.number().optional(),
      location: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateById(demoData.jobs, id, updates);
    }),

  deleteJob: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return updateById(demoData.jobs, input.id, { isActive: false });
    }),
});

export type AppRouter = typeof appRouter;