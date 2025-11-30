import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getSettings } from "@/lib/services";

export default async function LowStockReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const lang = settings?.preference?.language || "id";

  let products: { name: string; sku: string; stock: number; min: number; rack?: string }[] = [];
  let error: string | null = null;

  try {
    const rows = await prisma.product.findMany({
      where: { stock: { lte: prisma.product.fields.minStock } },
      include: { rackLocation: true },
      orderBy: { stock: "asc" },
    });
    products = rows.map((p: (typeof rows)[number]) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      min: p.minStock,
      rack: p.rackLocation?.name,
    }));
  } catch (e) {
    error = "Gagal memuat data stok rendah";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "lowStockPageTitle")}</h1>
        <p className="text-muted-foreground">{t(lang, "lowStockPageSubtitle")}</p>
      </div>
      <div className="flex justify-end">
        <a href="/api/reports/low-stock/csv" target="_blank" rel="noreferrer">
          <Button variant="outline">{t(lang, "downloadCsv")}</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "lowStock")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && products.length === 0 && (
            <p className="text-muted-foreground text-sm">{t(lang, "noData")}</p>
          )}
          {!error &&
            products.map((p) => (
              <div
                key={p.sku}
                className="flex items-center justify-between border rounded-lg px-4 py-3 bg-red-900/10"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                  {p.rack && <p className="text-xs text-muted-foreground">Rak: {p.rack}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {p.stock} pcs <span className="text-muted-foreground text-xs">(min {p.min})</span>
                  </p>
                  <Badge variant="destructive">{t(lang, "lowStockRestock")}</Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
