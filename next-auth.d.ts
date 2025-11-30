import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID */
      id: string;
      /** The user's role */
      role: string;
      /** The user's full name */
      nama_lengkap: string;
      /** The user's username */
      username: string;
      /** The user's email */
      email?: string | null;
    } & DefaultSession["user"];
  }

  /** Returned by the `jwt` callback and `token` argument of the `session` callback */
  interface JWT {
    /** The user's ID */
    id: string;
    /** The user's role */
    role: string;
    /** The user's full name */
    nama_lengkap: string;
    /** The user's username */
    username: string;
    /** The user's email */
    email?: string | null;
  }
}