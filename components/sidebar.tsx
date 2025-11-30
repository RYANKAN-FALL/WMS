"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { getClientLang } from "@/lib/i18n";

// Define navigation items with role-based access
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    roles: ["admin", "staff", "supervisor"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: "inventory",
    roles: ["admin", "staff", "supervisor"],
  },
  {
    title: "Kategori",
    href: "/categories",
    icon: "inventory", // Using inventory icon for now
    roles: ["admin", "staff", "supervisor"],
  },
  {
    title: "Lokasi Rak",
    href: "/rack-locations",
    icon: "inventory", // Using inventory icon for now
    roles: ["admin", "staff", "supervisor"],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: "orders",
    roles: ["admin", "staff", "supervisor"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "reports",
    roles: ["admin", "supervisor"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const lang = getClientLang();

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item =>
    !userRole || item.roles.includes(userRole)
  );

  return (
    <div className="w-64 border-r flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icons.inventory className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">WMS Dashboard</h2>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {session?.user?.nama_lengkap}
              </span>
              {userRole && (
                <Badge variant="secondary" className="text-xs">
                  {userRole}
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = Icons[item.icon as keyof typeof Icons];

            return (
              <li key={item.href}>
                <Link href={item.href} className="block">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 py-6",
                      isActive && "bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">
                      {lang === "en"
                        ? {
                            Dashboard: "Dashboard",
                            Inventory: "Inventory",
                            Kategori: "Categories",
                            "Lokasi Rak": "Rack Locations",
                            Orders: "Orders",
                            Reports: "Reports",
                            Settings: "Settings",
                          }[item.title] || item.title
                        : item.title}
                    </span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Add a separator and logout button */}
        <div className="pt-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 py-6"
            onClick={async () => {
              // Use next-auth signOut function instead of direct redirect
              const { signOut } = await import('next-auth/react');
              signOut({ redirect: true, callbackUrl: '/auth/login' });
            }}
          >
            <Icons.logout className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>
      <div className="p-4 border-t text-sm text-muted-foreground text-center">
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
}
