/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const productId = searchParams.get("productId") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {};

    if (productId) {
      whereCondition.productId = productId;
    }

    if (type) {
      whereCondition.type = type;
    }

    const inventoryLogs = await prisma.inventoryLog.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          }
        },
        user: {
          select: {
            nama_lengkap: true,
            username: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.inventoryLog.count({
      where: whereCondition,
    });

    return Response.json({
      data: inventoryLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching inventory logs:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, type, quantity, reason } = body;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    // Validate type
    if (!["IN", "OUT"].includes(type)) {
      return new Response("Invalid type. Must be 'IN' or 'OUT'", { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    // Update product stock based on type
    let newStock = product.stock;
    if (type === "IN") {
      newStock += quantity;
    } else {
      if (product.stock < quantity) {
        return new Response("Insufficient stock", { status: 400 });
      }
      newStock -= quantity;
    }

    // Create inventory log
    const inventoryLog = await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantity,
        reason,
        userId: session.user.id,
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    // Include product and user details in response
    const inventoryLogWithDetails = await prisma.inventoryLog.findUnique({
      where: { id: inventoryLog.id },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          }
        },
        user: {
          select: {
            nama_lengkap: true,
            username: true,
          }
        }
      }
    });

    return Response.json(inventoryLogWithDetails, { status: 201 });
  } catch (error) {
    logger.error("Error creating inventory log:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      productId,
      type,
      quantity,
      reason
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
