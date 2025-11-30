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

    // Parse URL to extract category ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const categoryId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!categoryId) {
      return new Response("Category ID is required", { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new Response("Category not found", { status: 404 });
    }

    return Response.json(category);
  } catch (error) {
    logger.error("Error fetching category:", {
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

    // Parse URL to extract category ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const categoryId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!categoryId) {
      return new Response("Category ID is required", { status: 400 });
    }

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return new Response("Category not found", { status: 404 });
    }

    const body = await req.json();
    const { name, description } = body;

    // Check if new name already exists for other categories
    const existingName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingName && existingName.id !== categoryId) {
      return new Response("Category with this name already exists", { status: 409 });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
      },
    });

    return Response.json(updatedCategory, { status: 200 });
  } catch (error) {
    logger.error("Error updating category:", {
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

    // Parse URL to extract category ID
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const categoryId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!categoryId) {
      return new Response("Category ID is required", { status: 400 });
    }

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return new Response("Category not found", { status: 404 });
    }

    // Check if category has associated products before deletion
    const productsUsingCategory = await prisma.product.count({
      where: { categoryId },
    });

    if (productsUsingCategory > 0) {
      return new Response("Cannot delete category: it has associated products", { status: 400 });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return new Response("Category deleted successfully", { status: 200 });
  } catch (error) {
    logger.error("Error deleting category:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}