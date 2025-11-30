/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultSettings, type SettingsData } from "@/lib/settings-data";

type SettingsPanelProps = {
  user: {
    nama: string;
    username: string;
    email?: string;
    role: string;
  };
  initialSettings: Partial<SettingsData>;
};

export function SettingsPanel({ user, initialSettings }: SettingsPanelProps) {
  const merged: SettingsData = {
    ...defaultSettings,
    ...initialSettings,
    profile: { ...defaultSettings.profile, ...(initialSettings.profile || {}) },
    security: { ...defaultSettings.security, ...(initialSettings.security || {}) },
    preference: { ...defaultSettings.preference, ...(initialSettings.preference || {}) },
    notification: { ...defaultSettings.notification, ...(initialSettings.notification || {}) },
    integration: { ...defaultSettings.integration, ...(initialSettings.integration || {}) },
  };
  const [settings, setSettings] = useState<SettingsData>(merged);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const action = async (url: string, method: "POST" | "PUT" = "POST", body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Permintaan gagal");
    }
    return res.json().catch(() => ({}));
  };

  const saveSettings = async (payload: Partial<SettingsData>) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...payload }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      const data = await res.json();
      setSettings(data);
      setMessage("Pengaturan tersimpan");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && <p className="text-sm">{message}</p>}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="preference">Preferensi</TabsTrigger>
          <TabsTrigger value="notification">Notifikasi</TabsTrigger>
          <TabsTrigger value="integration">Integrasi</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input
                value={settings.profile?.nama || user.nama}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, profile: { ...s.profile, nama: e.target.value } }))
                }
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={settings.profile?.username || user.username}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, profile: { ...s.profile, username: e.target.value } }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={settings.profile?.email || user.email || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, profile: { ...s.profile, email: e.target.value } }))
                }
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={settings.profile?.role || user.role}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, profile: { ...s.profile, role: e.target.value } }))
                }
              >
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="supervisor">supervisor</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ubah profil hanya dapat dilakukan oleh admin sistem.
          </p>
          <Button
            onClick={() =>
              saveSettings({
                profile: {
                  nama: settings.profile?.nama || user.nama,
                  username: settings.profile?.username || user.username,
                  email: settings.profile?.email || user.email || "",
                  role: settings.profile?.role || user.role,
                },
              })
            }
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="font-medium">Verifikasi Dua Langkah</p>
              <p className="text-xs text-muted-foreground">Tambah lapisan keamanan saat login.</p>
            </div>
            <Switch
              checked={settings.security.twoFactor}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, security: { ...s.security, twoFactor: checked } }))
              }
            />
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="font-medium">Notifikasi Login</p>
              <p className="text-xs text-muted-foreground">Kirim email saat ada login baru.</p>
            </div>
            <Switch
              checked={settings.security.loginAlert}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, security: { ...s.security, loginAlert: checked } }))
              }
            />
          </div>
          <div>
            <Label className="text-sm">Petunjuk OTP</Label>
            <Input
              value={settings.security.otpHint || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, security: { ...s.security, otpHint: e.target.value } }))
              }
              placeholder="Misal: Gunakan kode 246810 untuk demo"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ditampilkan di form login ketika 2FA aktif (demonstrasi).
            </p>
          </div>
          <Button onClick={() => saveSettings({ security: settings.security })} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Keamanan"}
          </Button>
        </TabsContent>

        <TabsContent value="preference" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Bahasa</Label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={settings.preference.language}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, preference: { ...s.preference, language: e.target.value } }))
                }
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <Label>Mata Uang</Label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={settings.preference.currency}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, preference: { ...s.preference, currency: e.target.value } }))
                }
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <Label>Tema</Label>
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={settings.preference.theme}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    preference: { ...s.preference, theme: e.target.value as SettingsData["preference"]["theme"] },
                  }))
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          <Button onClick={() => saveSettings({ preference: settings.preference })} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Preferensi"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme(settings.preference.theme)}
            disabled={saving}
          >
            Terapkan Tema
          </Button>
        </TabsContent>

        <TabsContent value="notification" className="space-y-3 pt-4">
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-xs text-muted-foreground">Kirim pemberitahuan via email</p>
            </div>
            <Switch
              checked={settings.notification.email}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, notification: { ...s.notification, email: checked } }))
              }
            />
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="font-medium">SMS</p>
              <p className="text-xs text-muted-foreground">Kirim pemberitahuan via SMS</p>
            </div>
            <Switch
              checked={settings.notification.sms}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, notification: { ...s.notification, sms: checked } }))
              }
            />
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="font-medium">Push</p>
              <p className="text-xs text-muted-foreground">Notifikasi aplikasi</p>
            </div>
            <Switch
              checked={settings.notification.push}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, notification: { ...s.notification, push: checked } }))
              }
            />
          </div>
          <Button onClick={() => saveSettings({ notification: settings.notification })} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Notifikasi"}
          </Button>
        </TabsContent>

        <TabsContent value="integration" className="space-y-3 pt-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              value={settings.integration.webhooks}
              onChange={(e) =>
                setSettings((s) => ({ ...s, integration: { ...s.integration, webhooks: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>API Key</Label>
            <Input
              value={settings.integration.apiKey || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, integration: { ...s.integration, apiKey: e.target.value } }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => saveSettings({ integration: settings.integration })} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Integrasi"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setMessage(null);
                  await action("/api/integrations/test-webhook", "POST", {
                    url: settings.integration.webhooks,
                  });
                  setMessage("Webhook test dikirim");
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : "Gagal kirim webhook");
                }
              }}
            >
              Kirim Tes Webhook
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setMessage(null);
                  await action("/api/notifications/test-login", "POST");
                  setMessage("Tes notifikasi login dikirim");
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : "Gagal kirim notifikasi");
                }
              }}
            >
              Tes Notifikasi Login
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
