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

    // Parse URL to extract product ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const productId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!productId) {
      return new Response("Product ID is required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        rackLocation: true,
      },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    logger.error("Error fetching product:", {
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

    // Parse URL to extract product ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const productId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!productId) {
      return new Response("Product ID is required", { status: 400 });
    }

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return new Response("Product not found", { status: 404 });
    }

    const body = await req.json();
    const { name, sku, categoryId, description, price, stock, minStock, rackLocationId, imageUrl } = body;

    // Check if new SKU already exists for other products
    const existingSKU = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSKU && existingSKU.id !== productId) {
      return new Response("Product with this SKU already exists", { status: 409 });
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        categoryId,
        description,
        price,
        stock,
        minStock,
        rackLocationId,
        imageUrl,
      },
    });

    return Response.json(updatedProduct, { status: 200 });
  } catch (error) {
    logger.error("Error updating product:", {
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

    // Parse URL to extract product ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const productId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!productId) {
      return new Response("Product ID is required", { status: 400 });
    }

    // Check if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return new Response("Product not found", { status: 404 });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return new Response("Product deleted successfully", { status: 200 });
  } catch (error) {
    logger.error("Error deleting product:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}