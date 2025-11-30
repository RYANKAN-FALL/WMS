import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import ProductTable from "@/components/product-table";
import { Icons } from "@/components/icons";
import prisma from "@/lib/db";
import { getSettings } from "@/lib/services";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const lang = settings?.preference?.language || "id";

  let transformedProducts: Array<{
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
  }> = [];
  let loadError: Error | null = null;

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        rackLocation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    transformedProducts = products.map((product: (typeof products)[number]) => ({
      id: product.id,
      sku: product.sku,
      nama_produk: product.name,
      kategori: product.category?.name || "Tanpa kategori",
      categoryId: product.categoryId,
      deskripsi: product.description || "",
      stok: product.stock,
      stok_minimum: product.minStock,
      lokasi_rak: product.rackLocation?.name || "",
      rackLocationId: product.rackLocationId || "",
      satuan: "pcs",
      harga: Number(product.price),
      created_at: product.createdAt,
      updated_at: product.updatedAt,
      imageUrl: product.imageUrl,
    }));
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    loadError = error as Error;
  }

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="text-center max-w-md">
            <div className="mx-auto bg-destructive/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Icons.alert className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground mb-4">
              Tidak dapat memuat data inventory. Silakan coba beberapa saat lagi.
            </p>
            <a
              href="/inventory"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Muat Ulang
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Inventory</h1>
          <p className="text-muted-foreground">
            Kelola produk dan stok gudang Anda
          </p>
        </div>

        <ProductTable products={transformedProducts} lang={lang} />
      </div>
    </DashboardLayout>
  );
}
