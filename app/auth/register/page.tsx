"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      // In a real application, you would call an API to register the user
      // For demo purposes, we'll just redirect to login
      console.log("Registration attempted with:", { username, email, password });
      router.push("/auth/login");
    } catch (error) {
      setError("Terjadi kesalahan saat pendaftaran");
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

      {/* Right side - Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Top right corner - Theme toggle */}
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Icons.user className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
              <CardDescription>
                Masukkan informasi Anda untuk membuat akun
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="py-6"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full py-6 text-lg" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Buat Akun"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
