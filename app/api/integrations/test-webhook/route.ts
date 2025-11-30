import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/services";
import { deliverWebhook } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const settings = await getSettings();
  const url = body.url || settings?.integration?.webhooks;

  if (!url || typeof url !== "string") {
    return new Response("Webhook URL belum diset", { status: 400 });
  }

  const payload = body.payload || {
    event: "test",
    message: "Webhook test dari WMS",
    user: {
      id: session.user?.id,
      username: session.user?.username,
    },
    timestamp: new Date().toISOString(),
  };

  await deliverWebhook(url, payload);
  return Response.json({ ok: true, deliveredTo: url, payload });
}
