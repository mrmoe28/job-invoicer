import { db } from '../index';
import { users, companies, contacts, jobs, tasks } from '../schema';
import { hashPassword } from '../utils/auth';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await db.delete(tasks);
      await db.delete(jobs);
      await db.delete(contacts);
      await db.delete(companies);
      await db.delete(users);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      email: 'admin@pulsecrm.local',
      passwordHash: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    }).returning();

    // Create manager user
    const [managerUser] = await db.insert(users).values({
      email: 'manager@pulsecrm.local',
      passwordHash: await hashPassword('manager123'),
      firstName: 'Project',
      lastName: 'Manager',
      role: 'manager',
    }).returning();

    // Create crew users
    const [crewUser1] = await db.insert(users).values({
      email: 'crew1@pulsecrm.local',
      passwordHash: await hashPassword('crew123'),
      firstName: 'John',
      lastName: 'Builder',
      role: 'crew',
    }).returning();

    const [crewUser2] = await db.insert(users).values({
      email: 'crew2@pulsecrm.local',
      passwordHash: await hashPassword('crew123'),
      firstName: 'Mike',
      lastName: 'Carpenter',
      role: 'crew',
    }).returning();

    console.log('✅ Users created successfully');

    // Create sample companies
    console.log('🏢 Creating companies...');
    const [company1] = await db.insert(companies).values({
      name: 'Downtown Development LLC',
      industry: 'Real Estate Development',
      website: 'https://downtowndev.com',
      address: '1234 Main Street, Suite 500',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      phone: '(404) 555-0123',
      email: 'info@downtowndev.com',
    }).returning();

    const [company2] = await db.insert(companies).values({
      name: 'Suburban Homes Inc.',
      industry: 'Residential Construction',
      website: 'https://suburbanhomes.com',
      address: '567 Oak Avenue',
      city: 'Marietta',
      state: 'GA',
      zipCode: '30064',
      phone: '(770) 555-0456',
      email: 'contact@suburbanhomes.com',
    }).returning();

    const [company3] = await db.insert(companies).values({
      name: 'Lakeside Properties',
      industry: 'Vacation Rentals',
      address: '890 Lake Drive',
      city: 'Lake Lanier',
      state: 'GA',
      zipCode: '30518',
      phone: '(706) 555-0789',
      email: 'info@lakesideprops.com',
    }).returning();

    console.log('✅ Companies created successfully');

    // Create contacts for companies
    console.log('👥 Creating contacts...');
    const [contact1] = await db.insert(contacts).values({
      companyId: company1.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'Project Manager',
      email: 'sarah.johnson@downtowndev.com',
      phone: '(404) 555-0124',
      mobile: '(404) 555-9876',
      isPrimary: true,
    }).returning();

    const [contact2] = await db.insert(contacts).values({
      companyId: company2.id,
      firstName: 'Robert',
      lastName: 'Smith',
      title: 'Operations Director',
      email: 'robert.smith@suburbanhomes.com',
      phone: '(770) 555-0457',
      isPrimary: true,
    }).returning();

    const [contact3] = await db.insert(contacts).values({
      companyId: company3.id,
      firstName: 'Emily',
      lastName: 'Davis',
      title: 'Property Owner',
      email: 'emily.davis@lakesideprops.com',
      phone: '(706) 555-0790',
      isPrimary: true,
    }).returning();

    console.log('✅ Contacts created successfully');

    // Create sample jobs
    console.log('💼 Creating jobs...');
    const [job1] = await db.insert(jobs).values({
      jobNumber: 'JOB-2024-001',
      title: 'Kitchen Renovation - Downtown Condo',
      description: 'Complete kitchen renovation including cabinets, countertops, appliances, and flooring.',
      companyId: company1.id,
      primaryContactId: contact1.id,
      assignedUserId: managerUser.id,
      status: 'in_progress',
      priority: 'high',
      estimatedStartDate: '2024-01-15',
      estimatedEndDate: '2024-02-28',
      estimatedBudget: '45000.00',
      location: '1234 Main St, Unit 505, Atlanta, GA 30309',
      requirements: 'High-end finishes, granite countertops, stainless steel appliances',
    }).returning();

    const [job2] = await db.insert(jobs).values({
      jobNumber: 'JOB-2024-002',
      title: 'Bathroom Remodel - Suburban Home',
      description: 'Master bathroom renovation with walk-in shower and double vanity.',
      companyId: company2.id,
      primaryContactId: contact2.id,
      assignedUserId: managerUser.id,
      status: 'scheduled',
      priority: 'medium',
      estimatedStartDate: '2024-02-01',
      estimatedEndDate: '2024-02-15',
      estimatedBudget: '22000.00',
      location: '567 Oak Ave, Marietta, GA 30064',
      requirements: 'Tile shower, marble vanity tops, modern fixtures',
    }).returning();

    const [job3] = await db.insert(jobs).values({
      jobNumber: 'JOB-2024-003',
      title: 'Deck Installation - Lakeside Property',
      description: 'New composite deck with railing overlooking the lake.',
      companyId: company3.id,
      primaryContactId: contact3.id,
      assignedUserId: managerUser.id,
      status: 'quoted',
      priority: 'low',
      estimatedStartDate: '2024-03-01',
      estimatedEndDate: '2024-03-10',
      estimatedBudget: '15000.00',
      location: '890 Lake Dr, Lake Lanier, GA 30518',
      requirements: 'Composite decking, cable railing system, built-in seating',
    }).returning();

    console.log('✅ Jobs created successfully');

    // Create sample tasks for Job 1
    console.log('✅ Creating tasks...');
    await db.insert(tasks).values([
      {
        jobId: job1.id,
        title: 'Demolition',
        description: 'Remove existing cabinets, countertops, and appliances',
        assignedUserId: crewUser1.id,
        status: 'completed',
        priority: 'high',
        estimatedHours: '16.00',
        actualHours: '14.50',
        orderIndex: 1,
        completedAt: new Date('2024-01-16T17:00:00Z'),
      },
      {
        jobId: job1.id,
        title: 'Electrical Work',
        description: 'Update electrical for new appliances and lighting',
        assignedUserId: crewUser2.id,
        status: 'completed',
        priority: 'high',
        estimatedHours: '12.00',
        actualHours: '13.00',
        orderIndex: 2,
        completedAt: new Date('2024-01-18T16:30:00Z'),
      },
      {
        jobId: job1.id,
        title: 'Plumbing',
        description: 'Install new sink and dishwasher connections',
        assignedUserId: crewUser1.id,
        status: 'in_progress',
        priority: 'high',
        estimatedHours: '8.00',
        orderIndex: 3,
      },
      {
        jobId: job1.id,
        title: 'Cabinet Installation',
        description: 'Install new kitchen cabinets and hardware',
        assignedUserId: crewUser2.id,
        status: 'pending',
        priority: 'medium',
        estimatedHours: '20.00',
        orderIndex: 4,
        dueDate: '2024-01-25',
      },
      {
        jobId: job1.id,
        title: 'Countertop Installation',
        description: 'Template, fabricate, and install granite countertops',
        status: 'pending',
        priority: 'medium',
        estimatedHours: '6.00',
        orderIndex: 5,
        dueDate: '2024-01-30',
      },
    ]);

    // Create sample tasks for Job 2
    await db.insert(tasks).values([
      {
        jobId: job2.id,
        title: 'Design Planning',
        description: 'Finalize design and material selections',
        assignedUserId: managerUser.id,
        status: 'completed',
        priority: 'high',
        estimatedHours: '4.00',
        actualHours: '3.50',
        orderIndex: 1,
        completedAt: new Date('2024-01-20T14:00:00Z'),
      },
      {
        jobId: job2.id,
        title: 'Permit Acquisition',
        description: 'Obtain necessary building permits',
        assignedUserId: managerUser.id,
        status: 'pending',
        priority: 'high',
        estimatedHours: '2.00',
        orderIndex: 2,
        dueDate: '2024-01-25',
      },
    ]);

    console.log('✅ Tasks created successfully');
    console.log('🎉 Database seeding completed!');

    return {
      users: { adminUser, managerUser, crewUser1, crewUser2 },
      companies: { company1, company2, company3 },
      contacts: { contact1, contact2, contact3 },
      jobs: { job1, job2, job3 },
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Utility function to reset database
export async function resetDatabase() {
  console.log('🗑️ Resetting database...');
  
  try {
    await db.delete(tasks);
    await db.delete(jobs);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}
