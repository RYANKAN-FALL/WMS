"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Icons } from "@/components/icons";
import { useSession, signOut } from "next-auth/react";

interface HeaderProps {
  title: string;
  showUser?: boolean;
  onSignOut?: () => void;
}

export function Header({ title, showUser = true, onSignOut }: HeaderProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          {showUser && session?.user && (
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
              <span className="font-medium">{session.user.nama_lengkap}</span>
              <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                {session.user.role}
              </span>
            </div>
          )}
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="h-9 w-9"
            aria-label="Sign out"
          >
            <Icons.logout className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
