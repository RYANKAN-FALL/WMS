"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [otpHint, setOtpHint] = useState<string | undefined>();
  const router = useRouter();

  // Fetch minimal settings needed for login (public)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/public");
        if (!res.ok) return;
        const data = await res.json();
        setTwoFactorEnabled(Boolean(data?.security?.twoFactor));
        setOtpHint(data?.security?.otpHint);
      } catch (e) {
        // best-effort only
        console.error("Failed to load login settings", e);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (twoFactorEnabled && otp.trim().length === 0) {
      setIsLoading(false);
      setError("Masukkan kode OTP (6 digit).");
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        otp,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "InvalidOtp") {
          setError("Kode OTP salah atau kadaluarsa");
        } else {
          setError("Username atau password salah");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Terjadi kesalahan saat login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Icons.inventory className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Warehouse Management System
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Solusi terpadu untuk mengelola gudang Anda dengan efisien dan efektif
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Top right corner - Theme toggle */}
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Icons.login className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
              <CardDescription>
                Masukkan kredensial Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="py-6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-6"
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Kode OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="6 digit"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="py-6 tracking-widest"
                    />
                    {otpHint && <p className="text-xs text-muted-foreground">{otpHint}</p>}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full py-6 text-lg" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk ke Akun"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Demo: admin/password, staff/password, supervisor/password
                </div>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
