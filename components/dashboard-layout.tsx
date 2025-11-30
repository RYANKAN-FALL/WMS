"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/sidebar";
import { Header } from "@/components/ui/header";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close sidebar on desktop view
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Initial load
    checkMobile();

    return () => window.removeEventListener("resize", checkMobile);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirect happens in useEffect
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background"
            >
              <Icons.menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent
          side="left"
          className="p-0 w-64 sm:w-64"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={`hidden md:block ${isMobile ? (sidebarOpen ? 'hidden' : '') : ''}`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0 transition-all duration-300">
        {/* Header */}
        <Header
          title="Warehouse Management System"
          onSignOut={handleSignOut}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
