import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import StatCard from "@/components/stat-card";
import SalesChart from "@/components/sales-chart";
import RecentOrders from "@/components/recent-orders";
import LowStockAlert from "@/components/low-stock-alert";
import prisma from "@/lib/db";
import { getReportsSummary } from "@/lib/services";
import { Icons } from "@/components/icons";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

const statusMap: Record<string, "pending" | "diproses" | "dikirim" | "selesai" | "batal"> = {
  pending: "pending",
  processing: "diproses",
  shipped: "dikirim",
  delivered: "selesai",
  cancelled: "batal",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const lang = settings?.preference?.language || "id";

  try {
    const [summary, products, orders] = await Promise.all([
      getReportsSummary(),
      prisma.product.findMany({
        include: {
          category: true,
          rackLocation: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true } },
            },
          },
          user: { select: { nama_lengkap: true } },
        },
      }),
    ]);

    const lowStockProducts = products.filter((product) => product.stock <= product.minStock);

    const weekdayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const salesChartData = summary.salesLast7Days.map((day) => {
      const dateObj = new Date(`${day.date}T00:00:00Z`);
      const weekday = weekdayNames[dateObj.getUTCDay()] || day.date;
      return { name: weekday, jumlah: Math.round(day.total) };
    });

    const recentOrders = orders.map((order) => ({
      id: order.id,
      nomor_order: order.orderId,
      customer_nama: order.user?.nama_lengkap || "Customer",
      customer_alamat: "",
      customer_telepon: "",
      produk: order.orderItems.map((item) => ({
        produk_id: item.productId,
        nama_produk: item.product?.name || "Produk",
        jumlah: item.quantity,
        harga_satuan: Number(item.price),
      })),
      total_harga: Number(order.totalAmount),
      status: statusMap[order.status] || "pending",
      nomor_resi: "",
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }));

    const lowStockProductList = lowStockProducts.map((product) => ({
      id: product.id,
      nama_produk: product.name,
      sku: product.sku,
      kategori: product.category?.name || "Tanpa kategori",
      deskripsi: product.description || "",
      stok: product.stock,
      lokasi_rak: product.rackLocation?.name || "",
      satuan: "pcs",
      harga: Number(product.price),
      stok_minimum: product.minStock,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    }));

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t(lang, "reportsTitle")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {lang === "en" ? "Welcome back," : "Selamat datang kembali,"}{" "}
              <span className="font-semibold">{session.user?.name || session.user?.username}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={lang === "en" ? "Total Products" : "Total Produk"}
              value={summary.totalProducts.toLocaleString("id-ID")}
              icon="inventory"
              color="blue"
            />
            <StatCard
              title={lang === "en" ? "Total Stock" : "Total Stok"}
              value={summary.totalStock.toLocaleString("id-ID")}
              icon="inventory"
              color="green"
            />
            <StatCard
              title={lang === "en" ? "Low Stock" : "Stok Menipis"}
              value={summary.lowStockProducts.toLocaleString("id-ID")}
              icon="alert"
              color="red"
            />
            <StatCard
              title={lang === "en" ? "Total Orders" : "Total Order"}
              value={summary.totalOrders.toLocaleString("id-ID")}
              icon="orders"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart data={salesChartData} />
            </div>
            <div className="space-y-6">
              <RecentOrders orders={recentOrders} lang={lang} />
              <LowStockAlert products={lowStockProductList} lang={lang} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="text-center max-w-md">
            <div className="mx-auto bg-destructive/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Icons.alert className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground mb-4">
              Tidak dapat memuat data dashboard. Silakan coba beberapa saat lagi.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Muat Ulang
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
