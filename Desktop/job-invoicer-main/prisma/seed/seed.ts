import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ekosolar.com' },
    update: {},
    create: {
      email: 'admin@ekosolar.com',
      password: hashedPassword,
      name: 'Admin User',
      company: 'EkoSolar',
      role: 'admin',
      isVerified: true,
      firstName: 'Admin',
      lastName: 'User'
    }
  });

  console.log({ adminUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
