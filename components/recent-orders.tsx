import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/schemas";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getClientLang, tn } from "@/lib/i18n";

interface RecentOrdersProps {
  orders: Order[];
  lang?: string;
}

const getStatusBadgeVariant = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "diproses":
      return "default";
    case "dikirim":
      return "outline";
    case "selesai":
      return "success";
    case "batal":
      return "destructive";
    default:
      return "secondary";
  };
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "diproses":
      return "Diproses";
    case "dikirim":
      return "Dikirim";
    case "selesai":
      return "Selesai";
    case "batal":
      return "Batal";
    default:
      return status;
  };
};

const RecentOrders = ({ orders, lang }: RecentOrdersProps) => {
  const detectedLang = lang || getClientLang();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tn(detectedLang, "Order Terbaru", "Latest Orders")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{order.nomor_order}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {detectedLang === "en"
                      ? order.total_harga.toLocaleString("en-US", { style: "currency", currency: "USD" })
                      : `Rp${order.total_harga.toLocaleString("id-ID")}`}
                  </p>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {tn(detectedLang, "Tidak ada order", "No orders")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
