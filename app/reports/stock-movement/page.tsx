import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

export default async function StockMovementReportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const locale = settings?.preference?.language === "en" ? enUS : id;
  const lang = settings?.preference?.language || "id";

  // Fetch latest inventory logs with product info
  const logs = await prisma.inventoryLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      product: true,
    },
  });

  // Group by date (UTC to keep stable)
  const movementsByDate: Record<string, typeof logs> = {};
  logs.forEach((movement) => {
    const date = movement.createdAt.toISOString().split('T')[0];
    if (!movementsByDate[date]) {
      movementsByDate[date] = [];
    }
    movementsByDate[date].push(movement);
  });

  const sortedDates = Object.keys(movementsByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "stockMovementPageTitle")}</h1>
        <p className="text-muted-foreground">
          {t(lang, "stockMovementPageSubtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "stockMovement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {sortedDates.map(date => {
              const movementsForDate = movementsByDate[date];
              return (
                <div key={date} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">
                    {format(new Date(date), "dd MMMM yyyy", { locale })}
                  </h3>
                  <div className="space-y-3">
                    {movementsForDate.map(movement => {
                      const product = movement.product;
                      return (
                        <div key={movement.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{product?.name || 'Produk Tidak Ditemukan'}</p>
                            <p className="text-sm text-muted-foreground">SKU: {product?.sku}</p>
                            {movement.reason && (
                              <p className="text-xs text-muted-foreground mt-1">Alasan: {movement.reason}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {movement.type === 'IN' ? '+' : '-'}
                              {movement.quantity} pcs
                            </p>
                            <Badge variant={movement.type === 'IN' ? 'success' : 'destructive'}>
                              {movement.type === 'IN' ? 'Stok Masuk' : 'Stok Keluar'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {sortedDates.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t(lang, "noData")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
