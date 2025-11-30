/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mock-auth.ts - Mock authentication system for development

import prisma from "@/lib/db";

// Define mock users (used for credential check only)
const mockUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password", // Plain text for demo
    nama_lengkap: "Admin User",
    role: "admin"
  },
  {
    username: "staff",
    email: "staff@example.com",
    password: "password",
    nama_lengkap: "Staff User", 
    role: "staff"
  },
  {
    username: "supervisor",
    email: "supervisor@example.com",
    password: "password",
    nama_lengkap: "Supervisor User",
    role: "supervisor"
  }
];

export async function mockSignIn(credentials: { username: string, password: string }) {
  const user = mockUsers.find(
    u => u.username === credentials.username && u.password === credentials.password
  );
  
  if (user) {
    // Ensure corresponding DB user exists and use its ID for FK safety
    const dbUser = await prisma.user.upsert({
      where: { username: user.username },
      update: { role: user.role, email: user.email, nama_lengkap: user.nama_lengkap },
      create: {
        username: user.username,
        email: user.email,
        password: user.password, // demo only (matches seed plaintext)
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });

    // Return a session-like object
    return {
      user: {
        id: dbUser.id,
        name: dbUser.nama_lengkap,
        email: dbUser.email || undefined,
        username: dbUser.username,
        role: dbUser.role
      },
      accessToken: "mock-access-token",
      expiresIn: "1d"
    };
  }
  return null;
}

export async function getSession(token: string) {
  // In a real app, you'd validate the token
  // For mock, just return a valid session
  if (token) {
    const user = await prisma.user.findFirst();
    if (user) {
      return {
        user: {
          id: user.id,
          name: user.nama_lengkap,
          email: user.email || undefined,
          username: user.username,
          role: user.role
        }
      };
    }
  }
  return null;
}

export async function getAllUsers() {
  return mockUsers;
}

// Mock data access functions
export const mockDB = {
  product: {
    findMany: async () => [],
    findUnique: async (args: { where: { id: string } }) => {
      // Return a mock product
      return {
        id: args.where.id,
        name: "Mock Product",
        sku: "MOCK-001",
        categoryId: "1",
        description: "Mock product description",
        price: 100000,
        stock: 10,
        minStock: 5,
        rackLocationId: "1",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    create: async (args: any) => args.data,
    update: async (args: any) => ({ ...args.data, id: args.where.id }),
    delete: async (args: any) => ({ id: args.where.id }),
    count: async () => 0,
    aggregate: async () => ({ _sum: { stock: 0 } })
  },
  category: {
    findMany: async () => [
      { id: "1", name: "Electronics", description: "Electronic items", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Clothing", description: "Clothing items", createdAt: new Date(), updatedAt: new Date() }
    ],
    findUnique: async (args: { where: { id: string } }) => {
      if (args.where.id === "1") {
        return { id: "1", name: "Electronics", description: "Electronic items", createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    },
    create: async (args: any) => args.data,
    update: async (args: any) => ({ ...args.data, id: args.where.id }),
    delete: async (args: any) => ({ id: args.where.id }),
    count: async () => 2
  },
  rackLocation: {
    findMany: async () => [
      { id: "1", name: "Rack-A1-01", description: "Main storage rack", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Rack-B1-02", description: "Secondary storage", createdAt: new Date(), updatedAt: new Date() }
    ],
    findUnique: async (args: { where: { id: string } }) => {
      if (args.where.id === "1") {
        return { id: "1", name: "Rack-A1-01", description: "Main storage rack", createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    },
    create: async (args: any) => args.data,
    update: async (args: any) => ({ ...args.data, id: args.where.id }),
    delete: async (args: any) => ({ id: args.where.id }),
    count: async () => 2
  },
  order: {
    findMany: async () => [],
    count: async () => 0,
  }
};
