import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse URL to extract location ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const locationId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!locationId) {
      return new Response("Rack Location ID is required", { status: 400 });
    }

    const location = await prisma.rackLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return new Response("Rack Location not found", { status: 404 });
    }

    return Response.json(location);
  } catch (error) {
    logger.error("Error fetching rack location:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse URL to extract location ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const locationId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!locationId) {
      return new Response("Rack Location ID is required", { status: 400 });
    }

    // Check if the location exists
    const existingLocation = await prisma.rackLocation.findUnique({
      where: { id: locationId },
    });

    if (!existingLocation) {
      return new Response("Rack Location not found", { status: 404 });
    }

    const body = await req.json();
    const { name, description } = body;

    // Check if new name already exists for other locations
    const existingName = await prisma.rackLocation.findUnique({
      where: { name },
    });

    if (existingName && existingName.id !== locationId) {
      return new Response("Rack Location with this name already exists", { status: 409 });
    }

    // Update the location
    const updatedLocation = await prisma.rackLocation.update({
      where: { id: locationId },
      data: {
        name,
        description,
      },
    });

    return Response.json(updatedLocation, { status: 200 });
  } catch (error) {
    logger.error("Error updating rack location:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse URL to extract location ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const locationId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!locationId) {
      return new Response("Rack Location ID is required", { status: 400 });
    }

    // Check if the location exists
    const existingLocation = await prisma.rackLocation.findUnique({
      where: { id: locationId },
    });

    if (!existingLocation) {
      return new Response("Rack Location not found", { status: 404 });
    }

    // Check if location has associated products before deletion
    const productsUsingLocation = await prisma.product.count({
      where: { rackLocationId: locationId },
    });

    if (productsUsingLocation > 0) {
      return new Response("Cannot delete location: it has associated products", { status: 400 });
    }

    // Delete the location
    await prisma.rackLocation.delete({
      where: { id: locationId },
    });

    return new Response("Rack Location deleted successfully", { status: 200 });
  } catch (error) {
    logger.error("Error deleting rack location:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}