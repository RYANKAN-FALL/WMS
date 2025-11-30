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

  const products = await prisma.product.findMany({
    where: { stock: { lte: prisma.product.fields.minStock } },
    include: { rackLocation: true, category: true },
    orderBy: { stock: "asc" },
  });

  const header = "sku,name,category,stock,min_stock,rack\n";
  const rows = products
    .map((p) =>
      [
        p.sku,
        p.name,
        p.category?.name || "",
        p.stock,
        p.minStock,
        p.rackLocation?.name || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const csv = header + rows;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="low-stock.csv"',
    },
  });
}
