import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

const statusLabel: Record<string, { id: string; en: string }> = {
  pending: { id: "Pending", en: "Pending" },
  processing: { id: "Diproses", en: "Processing" },
  shipped: { id: "Dikirim", en: "Shipped" },
  delivered: { id: "Selesai", en: "Delivered" },
  cancelled: { id: "Batal", en: "Cancelled" },
};

export default async function OrdersReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const locale = settings?.preference?.language === "en" ? enUS : id;
  const currencyCode = settings?.preference?.currency || "IDR";
  const numberFmt = new Intl.NumberFormat(settings?.preference?.language === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  const lang = settings?.preference?.language || "id";

  let orders: {
    id: string;
    orderId: string;
    status: string;
    total: number;
    createdAt: Date;
    customer: string;
  }[] = [];
  let error: string | null = null;

  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { nama_lengkap: true } },
      },
    });
    orders = rows.map((o: (typeof rows)[number]) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      total: Number(o.totalAmount),
      createdAt: o.createdAt,
      customer: o.user?.nama_lengkap || "Customer",
    }));
  } catch (e) {
    error = "Gagal memuat data order";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "ordersReportTitle")}</h1>
        <p className="text-muted-foreground">{t(lang, "ordersReportSubtitle")}</p>
      </div>
      <div className="flex justify-end">
        <a href="/api/reports/orders/csv" target="_blank" rel="noreferrer">
          <Button variant="outline">{t(lang, "downloadCsv")}</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && orders.length === 0 && (
            <p className="text-muted-foreground text-sm">{t(lang, "noOrders")}</p>
          )}
          {!error &&
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium">{order.orderId}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "dd MMM yyyy", { locale })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{numberFmt.format(order.total)}</p>
                  <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                    {statusLabel[order.status]?.[lang === "en" ? "en" : "id"] || order.status}
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
