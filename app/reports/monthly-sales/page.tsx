import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

export default async function MonthlySalesReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const currencyCode = settings?.preference?.currency || "IDR";
  const numberFmt = new Intl.NumberFormat(settings?.preference?.language === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  const lang = settings?.preference?.language || "id";

  let data: { month: string; total: number; orders: number }[] = [];
  let error: string | null = null;

  try {
    const orders = await prisma.order.findMany({
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    const map: Record<string, { total: number; orders: number }> = {};
    orders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!map[key]) map[key] = { total: 0, orders: 0 };
      map[key].total += Number(o.totalAmount);
      map[key].orders += 1;
    });

    data = Object.entries(map)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 12)
      .map(([month, val]) => ({ month, total: val.total, orders: val.orders }));
  } catch (e) {
    error = "Gagal memuat laporan penjualan bulanan";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "monthlySalesPageTitle")}</h1>
        <p className="text-muted-foreground">{t(lang, "monthlySalesPageSubtitle")}</p>
      </div>
      <div className="flex justify-end">
        <a href="/api/reports/monthly-sales/csv" target="_blank" rel="noreferrer">
          <Button variant="outline">{t(lang, "downloadCsv")}</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "monthlySalesPageTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && data.length === 0 && (
            <p className="text-muted-foreground text-sm">{t(lang, "noData")}</p>
          )}
          {!error &&
            data.map((row) => (
              <div
                key={row.month}
                className="flex items-center justify-between border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icons.reports className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{row.month}</p>
                    <p className="text-xs text-muted-foreground">{row.orders} order</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{numberFmt.format(row.total)}</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
