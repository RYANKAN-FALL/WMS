/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple mock user database for development
export const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "$2b$10$8K1p/a0TEdZJ/ZjH88GzpeU0oBxFqeV66QDCbHZ/Li0LWbEb6wI8m", // 'password' hashed with bcrypt
    nama_lengkap: "Admin User",
    role: "admin"
  },
  {
    id: "2", 
    username: "staff",
    email: "staff@example.com",
    password: "$2b$10$8K1p/a0TEdZJ/ZjH88GzpeU0oBxFqeV66QDCbHZ/Li0LWbEb6wI8m", // 'password' hashed
    nama_lengkap: "Staff User",
    role: "staff"
  },
  {
    id: "3",
    username: "supervisor",
    email: "supervisor@example.com", 
    password: "$2b$10$8K1p/a0TEdZJ/ZjH88GzpeU0oBxFqeV66QDCbHZ/Li0LWbEb6wI8m", // 'password' hashed
    nama_lengkap: "Supervisor User",
    role: "supervisor"
  }
];

// Simple mock database operations
export const mockDB = {
  user: {
    findUnique: async ({ where }: { where: { username?: string; id?: string } }) => {
      if (where.username) {
        return mockUsers.find(user => user.username === where.username) || null;
      }
      if (where.id) {
        return mockUsers.find(user => user.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: { data: any }) => {
      const newUser = {
        id: String(mockUsers.length + 1),
        ...data
      };
      mockUsers.push(newUser);
      return newUser;
    }
  }
};

export default mockDB;
