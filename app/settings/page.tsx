import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from '@/lib/services';
import { defaultSettings } from "@/lib/settings-data";
import { SettingsPanel } from "@/components/settings-panel";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  const rawSettings = await getSettings();
  const settings = {
    ...defaultSettings,
    ...rawSettings,
    profile: { ...defaultSettings.profile, ...(rawSettings.profile || {}) },
    security: { ...defaultSettings.security, ...(rawSettings.security || {}) },
    preference: { ...defaultSettings.preference, ...(rawSettings.preference || {}) },
    notification: { ...defaultSettings.notification, ...(rawSettings.notification || {}) },
    integration: { ...defaultSettings.integration, ...(rawSettings.integration || {}) },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola akun, keamanan, preferensi, notifikasi, dan integrasi
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Panel Pengaturan</CardTitle>
            <CardDescription>Pilih tab untuk mengubah pengaturan</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsPanel
              user={{
                nama: session.user?.nama_lengkap || settings.profile.nama,
                username: session.user?.username || settings.profile.username,
                email: session.user?.email || settings.profile.email,
                role: session.user?.role || "admin",
              }}
              initialSettings={settings}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
