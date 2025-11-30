import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/services";
import prisma from "@/lib/db";
import { defaultSettings } from "@/lib/settings-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await getSettings();
  return Response.json(data);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await getSettings();
    let merged = {
      ...defaultSettings,
      ...current,
      profile: { ...defaultSettings.profile, ...(current.profile || {}) },
      security: { ...defaultSettings.security, ...(current.security || {}) },
      preference: { ...defaultSettings.preference, ...(current.preference || {}) },
      notification: { ...defaultSettings.notification, ...(current.notification || {}) },
      integration: { ...defaultSettings.integration, ...(current.integration || {}) },
    };

    // Profile update also touches DB user
    if (body.profile) {
      const { nama, username, email, role } = body.profile;
      const userId = session.user?.id;
      if (!userId) return new Response("User not found", { status: 400 });

      await prisma.user.update({
        where: { id: userId },
        data: {
          nama_lengkap: nama,
          username,
          email,
          role,
        },
      });

      merged = { ...merged, profile: { ...merged.profile, nama, username, email, role } };
    }

    if (body.security) {
      merged = { ...merged, security: { ...merged.security, ...body.security } };
    }

    if (body.preference) {
      merged = { ...merged, preference: { ...merged.preference, ...body.preference } };
    }

    if (body.notification) {
      merged = { ...merged, notification: { ...merged.notification, ...body.notification } };
    }

    if (body.integration) {
      merged = { ...merged, integration: { ...merged.integration, ...body.integration } };
    }

    const updated = await updateSettings(merged);
    return Response.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update settings";
    return new Response(message, { status: 500 });
  }
}
