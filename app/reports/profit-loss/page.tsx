import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

export default async function ProfitLossReportPage() {
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

  let summary: { revenue: number; orders: number } = { revenue: 0, orders: 0 };
  let error: string | null = null;

  try {
    const orders = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { _all: true },
    });
    summary = {
      revenue: Number(orders._sum.totalAmount || 0),
      orders: orders._count._all || 0,
    };
  } catch (e) {
    error = "Gagal memuat data laba/rugi (sementara hanya omzet)";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "profitLossTitle")}</h1>
        <p className="text-muted-foreground">{t(lang, "profitLossSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "profitLossTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && (
            <>
              <p className="text-lg font-semibold">
                Omzet: {numberFmt.format(summary.revenue)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total order: {summary.orders}
              </p>
              <p className="text-xs text-muted-foreground">
                Catatan: kalkulasi biaya/pengeluaran belum tersedia.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
