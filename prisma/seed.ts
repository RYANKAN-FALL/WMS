import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoUsers() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create demo users
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        nama_lengkap: 'Admin User',
        role: 'admin',
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { username: 'staff' },
      update: {},
      create: {
        username: 'staff',
        email: 'staff@example.com',
        password: hashedPassword,
        nama_lengkap: 'Staff User',
        role: 'staff',
      },
    });

    const supervisorUser = await prisma.user.upsert({
      where: { username: 'supervisor' },
      update: {},
      create: {
        username: 'supervisor',
        email: 'supervisor@example.com',
        password: hashedPassword,
        nama_lengkap: 'Supervisor User',
        role: 'supervisor',
      },
    });

    console.log('Demo users created:');
    console.log('- Admin:', adminUser.username);
    console.log('- Staff:', staffUser.username);
    console.log('- Supervisor:', supervisorUser.username);

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoUsers();