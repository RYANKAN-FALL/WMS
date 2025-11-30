import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function handlePut(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(req.url);
    const queryId = url.searchParams.get('id');
    const body = await req.json().catch(() => ({}));
    const id = queryId || body.id;

    if (!id) return new Response('Rack location ID is required', { status: 400 });

    const { name, description } = body;

    const updated = await prisma.rackLocation.update({ where: { id }, data: { name, description } });
    return Response.json(updated);
  } catch (error) {
    logger.error("Error updating rack location:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function handleDelete(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(req.url);
    const queryId = url.searchParams.get('id');
    const body = await req.json().catch(() => ({}));
    const id = queryId || body.id;

    if (!id) return new Response('Rack location ID is required', { status: 400 });

    await prisma.rackLocation.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error("Error deleting rack location:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}