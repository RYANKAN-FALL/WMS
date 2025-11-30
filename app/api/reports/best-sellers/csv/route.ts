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

  const since = new Date();
  since.setMonth(since.getMonth() - 3);

  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: since } } },
    include: { product: true },
  });

  const map: Record<string, { qty: number; revenue: number; name: string; sku: string }> = {};
  items.forEach((it: (typeof items)[number]) => {
    const key = it.productId;
    if (!map[key]) {
      map[key] = {
        qty: 0,
        revenue: 0,
        name: it.product?.name || "Produk",
        sku: it.product?.sku || "",
      };
    }
    map[key].qty += it.quantity;
    map[key].revenue += Number(it.price) * it.quantity;
  });

  const rowsData = Object.values(map)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 200);

  const header = "sku,name,qty,revenue\n";
  const rows = rowsData
    .map((r) =>
      [r.sku, r.name, r.qty, r.revenue].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const csv = header + rows;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="best-sellers.csv"',
    },
  });
}
