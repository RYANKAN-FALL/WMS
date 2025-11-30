/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const userId = session.user.id;

    const skip = (page - 1) * limit;

    // Build where condition
    const whereCondition: any = {};

    // Only allow users to see their own orders unless they're admin
    if (session.user.role !== "admin") {
      whereCondition.userId = userId;
    }

    if (status) {
      whereCondition.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              }
            }
          }
        },
        user: {
          select: {
            nama_lengkap: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.order.count({
      where: whereCondition,
    });

    return Response.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching orders:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id,
      role: session?.user?.role
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const body = await req.json();
    const { orderItems, status = "pending" } = body;

    // Validate order items
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return new Response("Order items are required", { status: 400 });
    }

    // Calculate total amount and validate stock
    let totalAmount = 0;
    const productUpdates = [];

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return new Response(`Product with ID ${item.productId} not found`, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return new Response(`Insufficient stock for product ${product.name}`, { status: 400 });
      }

      totalAmount += Number(product.price) * item.quantity;

      // Prepare stock update
      productUpdates.push({
        id: product.id,
        newStock: product.stock - item.quantity,
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderId: `ORD-${Date.now()}`, // Generate a unique order ID
        status,
        totalAmount,
        userId: session.user.id,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || 0, // Use provided price or default to 0
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              }
            }
          }
        }
      }
    });

    // Update product stocks
    for (const update of productUpdates) {
      await prisma.product.update({
        where: { id: update.id },
        data: { stock: update.newStock },
      });
    }

    return Response.json(order, { status: 201 });
  } catch (error) {
    logger.error("Error creating order:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id,
      role: session?.user?.role
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PUT route to update order status
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { orderId, status } = body;

  try {
    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return new Response("Invalid status", { status: 400 });
    }

    // Update the order
    const order = await prisma.order.update({
      where: {
        id: orderId,
        // Only allow updating if user is admin or the order owner (for non-admins)
        ...(session.user.role !== "admin" ? { userId: session.user.id } : {})
      },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              }
            }
          }
        }
      }
    });

    return Response.json(order);
  } catch (error) {
    logger.error("Error updating order:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id,
      role: session?.user?.role,
      orderId,
      status
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
