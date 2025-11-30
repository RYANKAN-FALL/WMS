/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { mockSignIn } from "@/lib/mock-auth";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { getSettings } from "./services";
import { notifyLogin } from "./notify";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "Kode OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Try DB user first
        const dbUser = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (dbUser) {
          const valid = await bcrypt.compare(credentials.password, dbUser.password);
          if (!valid) return null;

          // Two-factor check (demo code)
          const settings = await getSettings();
          if (settings?.security?.twoFactor) {
            const expectedOtp = process.env.NEXT_PUBLIC_DEMO_OTP || "246810";
            if (!credentials.otp || credentials.otp !== expectedOtp) {
              throw new Error("InvalidOtp");
            }
          }

          return {
            id: dbUser.id,
            name: dbUser.nama_lengkap,
            email: dbUser.email || undefined,
            username: dbUser.username,
            role: dbUser.role,
            nama_lengkap: dbUser.nama_lengkap,
          };
        }

        // Fallback to mock (demo credentials tetap jalan)
        const result = await mockSignIn({
          username: credentials.username,
          password: credentials.password
        });

        if (result) {
          const settings = await getSettings();
          if (settings?.security?.twoFactor) {
            const expectedOtp = process.env.NEXT_PUBLIC_DEMO_OTP || "246810";
            if (!credentials.otp || credentials.otp !== expectedOtp) {
              throw new Error("InvalidOtp");
            }
          }

          return {
            id: result.user.id,
            name: (result.user as any).nama_lengkap || result.user.name,
            email: result.user.email,
            username: result.user.username,
            role: result.user.role,
            nama_lengkap: (result.user as any).nama_lengkap || result.user.name,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id?: string;
          username?: string;
          role?: string;
          nama_lengkap?: string;
          email?: string | null;
        };
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
        token.nama_lengkap = u.nama_lengkap;
        if (u.email) {
          token.email = u.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.nama_lengkap = token.nama_lengkap as string;
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user }) {
      type AuthUser = {
        id?: string;
        username?: string;
        nama_lengkap?: string;
        name?: string | null;
        email?: string | null;
      };
      const u = user as AuthUser;

      // Fire-and-forget login notifications based on settings
      notifyLogin({
        userId: u.id,
        username: u.username,
        nama: u.nama_lengkap || u.name || undefined,
        email: u.email || undefined,
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
