import { ReactNode } from "react";
import { Header } from "@/components/ui/header";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  showUser?: boolean;
  onSignOut?: () => void;
  className?: string;
}

export default function PageLayout({ 
  title, 
  children, 
  showUser = true, 
  onSignOut,
  className = ""
}: PageLayoutProps) {
  return (
    <div className={`flex-1 flex flex-col overflow-auto ${className}`}>
      <Header 
        title={title} 
        showUser={showUser} 
        onSignOut={onSignOut} 
      />
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/5">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}