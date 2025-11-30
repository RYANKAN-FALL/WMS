/* eslint-disable @typescript-eslint/no-explicit-any */
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
    email: session.user?.email || undefined,
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  return Response.json({ ok: true, message: "Test login notification dispatched" });
}
