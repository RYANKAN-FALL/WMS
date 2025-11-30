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
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where condition based on search
    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
            { category: { name: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        rackLocation: true,
      },
    });

    const total = await prisma.product.count({
      where: whereCondition,
    });

    return Response.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching products:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { name, sku, categoryId, description, price, stock, minStock, rackLocationId, imageUrl } = body;

    if (!name || !sku || !categoryId) {
      return new Response("Nama, SKU, dan kategori wajib diisi", { status: 400 });
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return new Response("Product with this SKU already exists", { status: 409 });
    }

    // Resolve creator user ID (mock auth may not exist in DB)
    const creator =
      (session.user.id && (await prisma.user.findUnique({ where: { id: session.user.id } }))) ||
      (session.user.username && (await prisma.user.findUnique({ where: { username: session.user.username } }))) ||
      (await prisma.user.findFirst());

    if (!creator) {
      return new Response("User tidak ditemukan di database", { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId, // Now references the Category model
        description,
        price,
        stock,
        minStock,
        rackLocationId, // Optional - references the RackLocation model
        imageUrl,
        userId: creator.id, // Track who created the product (fallback ke user DB)
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    logger.error("Error creating product:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
