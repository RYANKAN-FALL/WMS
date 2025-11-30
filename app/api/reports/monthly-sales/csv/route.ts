import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest) {
  void _req;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const orders = await prisma.order.findMany({
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const map: Record<string, { total: number; orders: number }> = {};
  orders.forEach((o: (typeof orders)[number]) => {
    const key = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!map[key]) map[key] = { total: 0, orders: 0 };
    map[key].total += Number(o.totalAmount);
    map[key].orders += 1;
  });

  const rowsData = Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1));

  const header = "month,total,orders\n";
  const rows = rowsData
    .map(([month, val]) => [month, val.total, val.orders].map((v) => `"${v}"`).join(","))
    .join("\n");

  const csv = header + rows;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="monthly-sales.csv"',
    },
  });
}
