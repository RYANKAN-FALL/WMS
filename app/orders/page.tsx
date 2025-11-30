import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import OrderTable from "@/components/order-table";
import prisma from "@/lib/db";
import { Icons } from "@/components/icons";
import { getSettings } from "@/lib/services";
import { t } from "@/lib/i18n";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const settings = await getSettings();
  const lang = settings?.preference?.language || "id";
  const currency = settings?.preference?.currency || "IDR";

  let transformedOrders: Array<{
    id: string;
    nomor_order: string;
    customer_nama: string;
    customer_alamat: string;
    customer_telepon: string;
    produk: Array<{ produk_id: string; nama_produk: string; jumlah: number; harga_satuan: number }>;
    total_harga: number;
    status: "pending" | "diproses" | "dikirim" | "selesai" | "batal";
    nomor_resi: string;
    created_at: Date;
    updated_at: Date;
  }> = [];
  let loadError: Error | null = null;

  try {
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          }
        },
        user: {
          select: {
            nama_lengkap: true,
          }
        }
      }
    });

    const statusMap: Record<string, "pending" | "diproses" | "dikirim" | "selesai" | "batal"> = {
      "pending": "pending",
      "processing": "diproses",
      "shipped": "dikirim",
      "delivered": "selesai",
      "cancelled": "batal"
    };

    transformedOrders = orders.map((order: (typeof orders)[number]) => ({
      id: order.id,
      nomor_order: order.orderId,
      customer_nama: order.user?.nama_lengkap || (lang === "en" ? "Customer" : "Customer"),
      customer_alamat: "",
      customer_telepon: "",
      produk: order.orderItems.map((item: (typeof order.orderItems)[number]) => ({
        produk_id: item.productId,
        nama_produk: item.product?.name || (lang === "en" ? "Unknown Product" : "Produk"),
        jumlah: item.quantity,
        harga_satuan: Number(item.price)
      })),
      total_harga: Number(order.totalAmount),
      status: statusMap[order.status] || "pending",
      nomor_resi: "",
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching orders data:", error);
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
              Tidak dapat memuat data order. Silakan coba beberapa saat lagi.
            </p>
            <a
              href="/orders"
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
            <h1 className="text-2xl font-bold tracking-tight">{t(lang, "ordersReportTitle")}</h1>
            <p className="text-muted-foreground">
              {t(lang, "ordersReportSubtitle")}
            </p>
          </div>

        <OrderTable orders={transformedOrders} lang={lang} currency={currency} />
        </div>
      </DashboardLayout>
    );
}
