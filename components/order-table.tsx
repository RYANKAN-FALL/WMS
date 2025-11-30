"use client";

import { useEffect, useMemo, useState } from "react";
import { Order } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { getClientLang, getCurrencyFormatter, getDateFormatter, tn } from "@/lib/i18n";

interface OrderTableProps {
  orders: Order[];
  lang?: string;
  currency?: string;
}

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
};

const statusBadgeVariant = (status: Order["status"]) => {
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
  }
};

const statusLabel = (status: Order["status"], lang: string) => {
  switch (status) {
    case "pending":
      return tn(lang, "Pending", "Pending");
    case "diproses":
      return tn(lang, "Diproses", "Processing");
    case "dikirim":
      return tn(lang, "Dikirim", "Shipped");
    case "selesai":
      return tn(lang, "Selesai", "Completed");
    case "batal":
      return tn(lang, "Batal", "Cancelled");
    default:
      return status;
  }
};

const statusApiMap: Record<Order["status"], string> = {
  pending: "pending",
  diproses: "processing",
  dikirim: "shipped",
  selesai: "delivered",
  batal: "cancelled",
};

const OrderTable = ({ orders, lang: langProp, currency = "IDR" }: OrderTableProps) => {
  const lang = langProp || getClientLang();
  const dateFormatter = useMemo(() => getDateFormatter(lang), [lang]);
  const currencyFormatter = useMemo(() => getCurrencyFormatter(lang, currency), [lang, currency]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setLoadError("");
      try {
        const response = await fetch("/api/products?limit=100");
        if (!response.ok) {
          throw new Error(tn(lang, "Gagal memuat daftar produk", "Failed to load products"));
        }
        const data = await response.json();
        const mapped: ProductOption[] = (data.data || []).map(
          (p: { id: string; name: string; price: number | string; stock: number; sku: string }) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            stock: p.stock,
            sku: p.sku,
          })
        );
        setProducts(mapped);
      } catch (err) {
        setLoadError((err as Error).message);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [lang]);

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.nomor_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [orders, searchTerm]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle>{tn(lang, "Daftar Order", "Orders List")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredOrders.length} {tn(lang, "order ditemukan", "orders found")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tn(lang, "Cari order...", "Search orders...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                {tn(lang, "Buat Order Baru", "Create Order")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl dialog-anim">
              <DialogHeader>
                <DialogTitle>{tn(lang, "Buat Order Baru", "Create Order")}</DialogTitle>
                <DialogDescription>
                  {tn(
                    lang,
                    "Buat order baru dan stok akan otomatis berkurang.",
                    "Create an order and stock will decrease automatically."
                  )}
                </DialogDescription>
              </DialogHeader>
              <OrderForm
                products={products}
                loading={loadingProducts}
                loadError={loadError}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  window.location.reload();
                }}
                lang={lang}
                currencyFormatter={currencyFormatter}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">{tn(lang, "Nomor Order", "Order No")}</TableHead>
                <TableHead>{tn(lang, "Nama Customer", "Customer")}</TableHead>
                <TableHead className="w-[120px]">{tn(lang, "Tanggal", "Date")}</TableHead>
                <TableHead className="text-right">{tn(lang, "Total Harga", "Total")}</TableHead>
                <TableHead>{tn(lang, "Status", "Status")}</TableHead>
                <TableHead>{tn(lang, "Nomor Resi", "Tracking No")}</TableHead>
                <TableHead className="text-right">{tn(lang, "Aksi", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium font-mono">{order.nomor_order}</TableCell>
                    <TableCell className="font-medium">{order.customer_nama}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(order.created_at))}</TableCell>
                    <TableCell className="text-right">{currencyFormatter.format(order.total_harga)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(order.status)} className="text-xs">
                        {statusLabel(order.status, lang)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.nomor_resi || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title={tn(lang, "Edit", "Edit")}>
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title={tn(lang, "Unduh", "Download")}>
                          <Icons.download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {tn(lang, "Tidak ada order ditemukan", "No orders found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderForm = ({
  products,
  loading,
  loadError,
  onClose,
  onSuccess,
  lang,
  currencyFormatter,
}: {
  products: ProductOption[];
  loading: boolean;
  loadError: string;
  onClose: () => void;
  onSuccess: () => void;
  lang: string;
  currencyFormatter: Intl.NumberFormat;
}) => {
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validItems = items.filter((item) => item.productId && item.quantity > 0);

  const totalHarga = useMemo(
    () =>
      validItems.reduce((total, item) => {
        const product = products.find((p) => p.id === item.productId);
        return total + (product ? product.price * item.quantity : 0);
      }, 0),
    [products, validItems]
  );

  const updateItem = (index: number, field: "productId" | "quantity", value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "quantity" ? Number(value) : value,
      };
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (validItems.length === 0) {
        throw new Error(
          tn(lang, "Tambahkan minimal satu item dengan jumlah valid.", "Add at least one item with a valid quantity.")
        );
      }

      const payload = {
        orderItems: validItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product ? product.price : 0,
          };
        }),
        status: statusApiMap[status],
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || tn(lang, "Gagal membuat order", "Failed to create order"));
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {loadError && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">{tn(lang, "Status Order", "Order Status")}</Label>
          <select
            className="w-full p-3 border rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
            value={status}
            onChange={(e) => setStatus(e.target.value as Order["status"])}
          >
            <option value="pending">{tn(lang, "Pending", "Pending")}</option>
            <option value="diproses">{tn(lang, "Diproses", "Processing")}</option>
            <option value="dikirim">{tn(lang, "Dikirim", "Shipped")}</option>
            <option value="selesai">{tn(lang, "Selesai", "Completed")}</option>
            <option value="batal">{tn(lang, "Batal", "Cancelled")}</option>
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            {tn(
              lang,
              "Status diterjemahkan otomatis ke status operasional sistem.",
              "Status will be mapped to the system workflow automatically."
            )}
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted-foreground">{tn(lang, "Total Estimasi", "Estimated Total")}</p>
          <p className="text-2xl font-semibold">{currencyFormatter.format(totalHarga)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tn(lang, "Item Produk", "Order Items")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {tn(lang, "Stok akan otomatis berkurang sesuai jumlah yang dipesan.", "Stock will decrease based on quantities added.")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => {
            const selectedProduct = products.find((p) => p.id === item.productId);
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center border rounded-lg p-3 bg-muted/40"
              >
                <div className="col-span-5">
                  <Label className="text-xs text-muted-foreground">{tn(lang, "Produk", "Product")}</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
                    value={item.productId}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    disabled={loading}
                  >
                    <option value="">{tn(lang, "Pilih produk...", "Select a product...")}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {tn(lang, "Stok", "Stock")}: {selectedProduct.stock} · {tn(lang, "Harga", "Price")}:{" "}
                      {currencyFormatter.format(selectedProduct.price)}
                    </p>
                  )}
                </div>
                <div className="col-span-3">
                  <Label className="text-xs text-muted-foreground">{tn(lang, "Jumlah", "Qty")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    disabled={loading}
                  />
                </div>
                <div className="col-span-3 text-right">
                  <Label className="text-xs text-muted-foreground block">{tn(lang, "Subtotal", "Subtotal")}</Label>
                  <p className="font-semibold">
                    {currencyFormatter.format(selectedProduct ? selectedProduct.price * item.quantity : 0)}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600"
                      type="button"
                      disabled={loading}
                      title={tn(lang, "Hapus baris", "Remove row")}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          <Button variant="outline" className="w-full" type="button" onClick={addItem} disabled={loading}>
            <Icons.plus className="mr-2 h-4 w-4" />
            {tn(lang, "Tambah Item", "Add Item")}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} type="button" disabled={submitting}>
          {tn(lang, "Batal", "Cancel")}
        </Button>
        <Button type="submit" disabled={submitting || loading}>
          {submitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {tn(lang, "Menyimpan...", "Saving...")}
            </>
          ) : (
            tn(lang, "Simpan Order", "Save Order")
          )}
        </Button>
      </div>
    </form>
  );
};

export default OrderTable;
