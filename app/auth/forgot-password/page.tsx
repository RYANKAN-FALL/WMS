"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // In a real application, you would call an API to send a password reset email
      console.log("Password reset requested for:", email);
      setSuccess(true);
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim permintaan reset password");
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

      {/* Right side - Forgot Password Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Top right corner - Theme toggle */}
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Icons.lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Lupa Password?</CardTitle>
              <CardDescription>
                Masukkan email Anda dan kami akan kirimkan link reset password
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      Link reset password telah dikirim ke email Anda. Silakan periksa inbox Anda.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-6"
                    disabled={success}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {!success ? (
                  <Button className="w-full py-6 text-lg" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Link Reset"
                    )}
                  </Button>
                ) : (
                  <Button className="w-full py-6 text-lg" asChild>
                    <Link href="/auth/login">Kembali ke Login</Link>
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Ingat password Anda?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}