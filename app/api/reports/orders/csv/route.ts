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
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nama_lengkap: true } } },
    take: 500,
  });

  const header = "order_id,customer,status,total,created_at\n";
  const rows = orders
    .map((o: (typeof orders)[number]) =>
      [
        o.orderId,
        o.user?.nama_lengkap || "Customer",
        o.status,
        Number(o.totalAmount),
        o.createdAt.toISOString(),
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
      "Content-Disposition": 'attachment; filename="orders.csv"',
    },
  });
}
