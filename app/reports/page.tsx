import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { getSettings } from "@/lib/services";
import { getCurrencyFormatter, getDateFormatter, t, tn } from "@/lib/i18n";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const lang = settings?.preference?.language || "id";
  const currency = settings?.preference?.currency || "IDR";
  const currencyFormatter = getCurrencyFormatter(lang, currency);
  const dateFormatter = getDateFormatter(lang);

  type ProductCountResult = {
    count: bigint;
  };

  let totalOrders = 0;
  let lowStockProducts = 0;
  let recentOrders: Array<{
    id: string;
    orderId: string;
    totalAmount: number;
    createdAt: Date;
    user: { nama_lengkap: string | null } | null;
  }> = [];
  let loadError: Error | null = null;

  try {
    [totalOrders, lowStockProducts, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.$queryRaw<ProductCountResult[]>`
        SELECT COUNT(*) as count
        FROM Product
        WHERE stock <= minStock
      `.then((result: ProductCountResult[]) => Number(result[0].count)),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          orderItems: true,
          user: {
            select: {
              nama_lengkap: true
            }
          }
        }
      })
    ]);
  } catch (error) {
    console.error("Error fetching reports data:", error);
    loadError = error as Error;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="text-center max-w-md">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Icons.alert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mb-4">
            Tidak dapat memuat data laporan. Silakan coba beberapa saat lagi.
          </p>
          <a
            href="/reports"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Muat Ulang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "reportsTitle")}</h1>
        <p className="text-muted-foreground">
          {t(lang, "reportsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/reports/stock-movement" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "stockMovement")}</CardTitle>
              <Icons.inventory className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tn(lang, "Tersedia", "Available")}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "stockMovementDesc")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/monthly-sales" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "monthlySales")}</CardTitle>
              <Icons.reports className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tn(lang, "Tersedia", "Available")}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "monthlySalesDesc")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/best-sellers" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "bestSellers")}</CardTitle>
              <Icons.inventory className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tn(lang, "Tersedia", "Available")}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "bestSellersDesc")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/orders" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "orders")}</CardTitle>
              <Icons.orders className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "ordersDesc")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/low-stock" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "lowStock")}</CardTitle>
              <Icons.alert className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "lowStockDesc")}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/profit-loss" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(lang, "profitLoss")}</CardTitle>
              <Icons.reports className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tn(lang, "Tersedia", "Available")}</div>
              <p className="text-xs text-muted-foreground">{t(lang, "profitLossDesc")}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "recentOrders")}</CardTitle>
          <CardDescription>
            {recentOrders.length} {tn(lang, "order terbaru", "recent orders")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.orderId}</p>
                    <p className="text-sm text-muted-foreground">{order.user?.nama_lengkap}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{currencyFormatter.format(Number(order.totalAmount))}</p>
                    <p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(order.createdAt))}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">{t(lang, "noOrders")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
