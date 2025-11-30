declare module "@prisma/client" {
  import { PrismaClient as PC } from "@prisma/client/runtime/library";
  export const PrismaClient: typeof PC;
  export type PrismaClient = PC;
}
