import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyLogin } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await notifyLogin({
    userId: session.user?.id,
    username: session.user?.username,
    nama: session.user?.nama_lengkap,
    email: session.user?.email,
    ip: (req as any)?.headers?.get?.("x-forwarded-for") || undefined,
    userAgent: (req as any)?.headers?.get?.("user-agent") || undefined,
  });

  return Response.json({ ok: true, message: "Test login notification dispatched" });
}
