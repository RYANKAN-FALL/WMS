"use client";

import { useMemo, useState } from "react";
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
import ProductForm from "./product-form";
import EditProductForm from "./edit-product-form";
import { cn } from "@/lib/utils";
import { getClientLang, tn } from "@/lib/i18n";

type InventoryProduct = {
  id: string;
  sku: string;
  nama_produk: string;
  kategori: string;
  categoryId?: string;
  deskripsi?: string;
  stok: number;
  stok_minimum: number;
  lokasi_rak?: string;
  rackLocationId?: string;
  satuan: string;
  harga: number;
  created_at: Date;
  updated_at: Date;
  imageUrl?: string | null;
};

interface ProductTableProps {
  products: InventoryProduct[];
  lang?: string;
}

const ProductTable = ({ products, lang }: ProductTableProps) => {
  const detectedLang = lang || getClientLang();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [editFormData, setEditFormData] = useState<{
    categories: Array<{ id: string; name: string }>;
    rackLocations: Array<{ id: string; name: string }>;
  } | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.kategori.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const getStockStatus = (product: InventoryProduct) => {
    if (product.stok <= product.stok_minimum) {
      return { status: "Stok Rendah", variant: "destructive" as const, tone: "text-red-200" };
    } else if (product.stok < product.stok_minimum * 2) {
      return { status: "Waspada", variant: "default" as const, tone: "text-amber-200" };
    } else {
      return { status: "Aman", variant: "secondary" as const, tone: "text-emerald-300" };
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle>{tn(detectedLang, "Daftar Produk", "Product List")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} {tn(detectedLang, "produk ditemukan", "products found")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tn(detectedLang, "Cari produk...", "Search products...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                {tn(detectedLang, "Tambah Produk", "Add Product")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl dialog-anim">
              <DialogHeader>
                <DialogTitle>{tn(detectedLang, "Tambah Produk Baru", "Add New Product")}</DialogTitle>
                <DialogDescription>
                  {tn(
                    detectedLang,
                    "Tambahkan produk baru ke dalam sistem manajemen inventory",
                    "Add a new product to the inventory system"
                  )}
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  window.location.reload();
                }}
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
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>{tn(detectedLang, "Nama Produk", "Product Name")}</TableHead>
                <TableHead>{tn(detectedLang, "Kategori", "Category")}</TableHead>
                <TableHead className="text-right">{tn(detectedLang, "Stok", "Stock")}</TableHead>
                <TableHead>{tn(detectedLang, "Lokasi Rak", "Rack")}</TableHead>
                <TableHead>{tn(detectedLang, "Satuan", "Unit")}</TableHead>
                <TableHead className="text-right">{tn(detectedLang, "Harga", "Price")}</TableHead>
                <TableHead>{tn(detectedLang, "Status", "Status")}</TableHead>
                <TableHead className="text-right">{tn(detectedLang, "Aksi", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const isCritical = stockStatus.variant === "destructive";
                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        isCritical &&
                          "bg-red-900/30 hover:bg-red-900/40 border-y border-red-800/70 text-red-50"
                      )}
                    >
                      <TableCell className="font-medium font-mono">{product.sku}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{product.nama_produk}</span>
                          {product.deskripsi && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{product.deskripsi}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span>{product.stok} {product.satuan}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.lokasi_rak || "-"}</TableCell>
                      <TableCell>{product.satuan}</TableCell>
                      <TableCell className="text-right">Rp{product.harga.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={stockStatus.variant}
                          className={cn(
                            "text-xs",
                            isCritical && "bg-red-800/80 text-red-50 border-red-700"
                          )}
                        >
                          {stockStatus.status}
                        </Badge>
                        <p className={`text-[11px] ${stockStatus.tone} mt-1`}>
                          {tn(detectedLang, "Min", "Min")} {product.stok_minimum} {product.satuan}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={async () => {
                              setEditingProduct(product);
                              try {
                                const [catsRes, racksRes] = await Promise.all([fetch('/api/categories'), fetch('/api/rack-locations')]);
                                const cats = catsRes.ok ? (await catsRes.json()).data : [];
                                const racks = racksRes.ok ? (await racksRes.json()).data : [];
                                setEditFormData({ categories: cats, rackLocations: racks });
                                setEditDialogOpen(true);
                              } catch (err) {
                                console.error('Failed to load edit data', err);
                                alert('Gagal memuat data untuk edit produk');
                              }
                            }}
                          >
                            <Icons.edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={async () => {
                              const msg = tn(
                                detectedLang,
                                `Apakah Anda yakin ingin menghapus produk "${product.nama_produk}"?`,
                                `Are you sure you want to delete product "${product.nama_produk}"?`
                              );
                              if (confirm(msg)) {
                                try {
                                  const response = await fetch(`/api/products/${product.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                                    console.error('Delete error response:', errorData);
                                    throw new Error('Gagal menghapus produk: ' + (errorData.error || response.status));
                                  }

                                  window.location.reload();
                                } catch (error) {
                                  console.error('Error deleting product:', error);
                                  alert('Gagal menghapus produk: ' + (error as Error).message);
                                }
                              }
                            }}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    {tn(detectedLang, "Tidak ada produk ditemukan", "No products found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditingProduct(null); setEditDialogOpen(false); } else setEditDialogOpen(true); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl dialog-anim">
          <DialogHeader>
            <DialogTitle>Ubah Produk</DialogTitle>
            <DialogDescription>Perbarui data produk jika ada kesalahan input.</DialogDescription>
          </DialogHeader>
          {editingProduct && editFormData ? (
            <EditProductForm
              product={{
                id: editingProduct.id,
                name: editingProduct.nama_produk,
                sku: editingProduct.sku,
                categoryId: editingProduct.categoryId || "",
                description: editingProduct.deskripsi || "",
                price: editingProduct.harga || 0,
                stock: editingProduct.stok || 0,
                minStock: editingProduct.stok_minimum || 0,
                rackLocationId: editingProduct.rackLocationId || "",
                imageUrl: editingProduct.imageUrl || "",
              }}
              categories={editFormData.categories}
              rackLocations={editFormData.rackLocations}
              onClose={() => { setEditDialogOpen(false); setEditingProduct(null); }}
              onSuccess={() => { setEditDialogOpen(false); setEditingProduct(null); window.location.reload(); }}
            />
          ) : (
            <p className="p-4">Memuat data...</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductTable;
