import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

export default async function BestSellersReportPage() {
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

  let rows: { name: string; sku: string; qty: number; revenue: number }[] = [];
  let error: string | null = null;

  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);

    const items = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      include: { product: true, order: true },
    });

    const map: Record<string, { qty: number; revenue: number; name: string; sku: string }> = {};
    items.forEach((it) => {
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

    rows = Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  } catch (e) {
    error = "Gagal memuat produk terlaris";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "bestSellersPageTitle")}</h1>
        <p className="text-muted-foreground">{t(lang, "bestSellersPageSubtitle")}</p>
      </div>
      <div className="flex justify-end">
        <a href="/api/reports/best-sellers/csv" target="_blank" rel="noreferrer">
          <Button variant="outline">{t(lang, "downloadCsv")}</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "bestSellers")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && rows.length === 0 && (
            <p className="text-muted-foreground text-sm">{t(lang, "noData")}</p>
          )}
          {!error &&
            rows.map((row, idx) => (
              <div
                key={row.sku + idx}
                className="flex items-center justify-between border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">#{idx + 1}</Badge>
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {row.sku || "-"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{row.qty} terjual</p>
                  <p className="text-xs text-muted-foreground">{numberFmt.format(row.revenue)}</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
