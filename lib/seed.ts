import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Hash the default password
    const hashedPassword = await bcrypt.hash("password", 10);

    // Create default users
    const users = [
      {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        nama_lengkap: "Admin Gudang",
        role: "admin",
      },
      {
        username: "staff",
        email: "staff@example.com",
        password: hashedPassword,
        nama_lengkap: "Staff Gudang",
        role: "staff",
      },
      {
        username: "supervisor",
        email: "supervisor@example.com",
        password: hashedPassword,
        nama_lengkap: "Supervisor Gudang",
        role: "supervisor",
      },
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: userData,
        });
        console.log(`Created user: ${userData.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedUsers();
}

export default seedUsers;