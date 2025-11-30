/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from './db';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';

const SETTINGS_PATH = path.join(process.cwd(), 'lib', 'settings.json');

// Categories
export async function getCategories({ page = 1, limit = 20, search = '' } = {}) {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};
  const [data, total] = await Promise.all([
    prisma.category.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.category.count({ where }),
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function createCategory({ name, description }: { name: string; description?: string }) {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new Error('Category already exists');
  return prisma.category.create({ data: { name, description } });
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new Error('Category has products');
  return prisma.category.delete({ where: { id } });
}

// Rack locations
export async function getRackLocations({ page = 1, limit = 20, search = '' } = {}) {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};
  const [data, total] = await Promise.all([
    prisma.rackLocation.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.rackLocation.count({ where }),
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function createRackLocation({ name, description }: { name: string; description?: string }) {
  const existing = await prisma.rackLocation.findUnique({ where: { name } });
  if (existing) throw new Error('Rack location already exists');
  return prisma.rackLocation.create({ data: { name, description } });
}

export async function updateRackLocation(id: string, data: { name?: string; description?: string }) {
  return prisma.rackLocation.update({ where: { id }, data });
}

export async function deleteRackLocation(id: string) {
  const count = await prisma.product.count({ where: { rackLocationId: id } });
  if (count > 0) throw new Error('Rack location has products');
  return prisma.rackLocation.delete({ where: { id } });
}

// Orders
export async function createOrder(userId: string, orderItems: { productId: string; quantity: number; price?: number }[], status: string = 'pending') {
  if (!Array.isArray(orderItems) || orderItems.length === 0) throw new Error('Order must have items');

  // Validate and calculate
  let totalAmount = 0;
  const productUpdates: { id: string; newStock: number }[] = [];

  for (const item of orderItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    totalAmount += Number(product.price) * item.quantity;
    productUpdates.push({ id: product.id, newStock: product.stock - item.quantity });
  }

  const order = await prisma.order.create({
    data: {
      orderId: `ORD-${Date.now()}`,
      status,
      totalAmount,
      userId,
      orderItems: { create: orderItems.map(it => ({ productId: it.productId, quantity: it.quantity, price: it.price || 0 })) },
    },
    include: { orderItems: { include: { product: true } } },
  });

  // Update stock
  for (const u of productUpdates) {
    await prisma.product.update({ where: { id: u.id }, data: { stock: u.newStock } });
  }

  return order;
}

export async function updateOrderStatus(orderId: string, status: string, userId?: string, isAdmin: boolean = false) {
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) throw new Error('Invalid status');

  const where: { id: string; userId?: string } = { id: orderId };
  if (!isAdmin && userId) where.userId = userId;

  const updated = await prisma.order.update({ where, data: { status }, include: { orderItems: { include: { product: true } } } });
  return updated;
}

// Reports
export async function getReportsSummary() {
  try {
    const totalProducts = await prisma.product.count();
    const totalStockAgg = await prisma.product.aggregate({ _sum: { stock: true } });
    const totalStock = Number(totalStockAgg._sum.stock || 0);
    const totalOrders = await prisma.order.count();

    const lowStockResult = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM Product WHERE stock <= minStock`;
    const lowStockProducts = Number(lowStockResult[0]?.count || 0);

    // Sales last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const orders = await prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, totalAmount: true } });
    const days: { date: string; total: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const total = orders
        .filter((o: (typeof orders)[number]) => o.createdAt.toISOString().split('T')[0] === key)
        .reduce((s, o: (typeof orders)[number]) => s + Number(o.totalAmount), 0);
      days.push({ date: key, total });
    }

    // Top sellers last 30 days
    const since30 = new Date();
    since30.setDate(since30.getDate() - 29);
    const orderItems = await prisma.orderItem.findMany({ where: { order: { createdAt: { gte: since30 } } }, include: { product: true } });
    const salesMap: Record<string, number> = {};
    for (const it of orderItems) { salesMap[it.productId] = (salesMap[it.productId] || 0) + it.quantity; }
    const topSellers = Object.entries(salesMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([productId, qty])=>({ productId, qty }));
    const topWithNames = await Promise.all(topSellers.map(async ts => { const p = await prisma.product.findUnique({ where: { id: ts.productId } }); return { ...ts, name: p?.name || 'Unknown' }; }));

    return { totalProducts, totalStock, totalOrders, lowStockProducts, salesLast7Days: days, topSellers: topWithNames };
  } catch (error) {
    logger.error('Error generating report summary', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

// Settings
export async function getSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function updateSettings(newSettings: any) {
  try {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
    return newSettings;
  } catch (e) {
    logger.error('Error writing settings', { error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}
