import { ReactNode } from "react";
import headerFooterPattern from "@assets/header_footer_1_(1)_1768527709521.png";

interface LayoutProps {
  children: ReactNode;
  hidePattern?: boolean;
}

export function Layout({ children, hidePattern = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {!hidePattern && (
        <div 
          className="h-16 w-full bg-cover bg-center shrink-0 z-10"
          style={{ backgroundImage: `url(${headerFooterPattern})` }}
        />
      )}
      
      <main className="flex-1 flex flex-col relative z-0 overflow-y-auto">
        {children}
      </main>
      
      {!hidePattern && (
        <div 
          className="h-16 w-full bg-cover bg-center shrink-0 z-10 mt-auto"
          style={{ backgroundImage: `url(${headerFooterPattern})` }}
        />
      )}
    </div>
  );
}
