import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/lib/schemas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { getClientLang, tn } from "@/lib/i18n";

interface LowStockAlertProps {
  products: Product[];
  lang?: string;
}

const LowStockAlert = ({ products, lang }: LowStockAlertProps) => {
  const detectedLang = lang || getClientLang();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tn(detectedLang, "Peringatan Stok Rendah", "Low Stock Alert")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((product) => (
              <Alert key={product.id} variant="destructive">
                <Icons.alert className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between">
                    <span>{product.nama_produk} (SKU: {product.sku})</span>
                    <span className="font-medium">{product.stok} {product.satuan}</span>
                  </div>
                  <div className="text-xs mt-1">
                    {tn(detectedLang, "Stok minimum", "Min stock")}: {product.stok_minimum} {product.satuan}
                  </div>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Alert>
              <AlertDescription className="text-center py-2">
                {tn(detectedLang, "Semua produk memiliki stok yang mencukupi", "All products have sufficient stock")}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
