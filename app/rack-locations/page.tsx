import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import prisma from "@/lib/db";
import RackLocationTable from "@/components/rack-location-table";
import { Icons } from "@/components/icons";

interface RackLocation {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  productCount: number;
}

export default async function RackLocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  let transformedRackLocations: RackLocation[] = [];
  let loadError: Error | null = null;

  try {
    const rackLocations = await prisma.rackLocation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        products: true,
      },
    });

    transformedRackLocations = rackLocations.map(location => ({
      id: location.id,
      name: location.name,
      description: location.description,
      createdAt: location.createdAt,
      productCount: location.products.length,
    }));
  } catch (error) {
    console.error("Error fetching rack locations data:", error);
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
              Tidak dapat memuat data lokasi rak. Silakan coba beberapa saat lagi.
            </p>
            <a
              href="/rack-locations"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Lokasi Rak</h1>
            <p className="text-muted-foreground">
              Kelola lokasi rak untuk organisasi inventory
            </p>
          </div>
        </div>

        <RackLocationTable rackLocations={transformedRackLocations} />
      </div>
    </DashboardLayout>
  );
}
