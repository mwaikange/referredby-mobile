import { ReactNode } from "react";
import headerFooterPattern from "@assets/header_footer_1_(1)_1768528118503.png";

interface LayoutProps {
  children: ReactNode;
  hidePattern?: boolean;
}

export function Layout({ children, hidePattern = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      {!hidePattern && (
        <div 
          className="h-20 w-full bg-cover bg-center shrink-0 z-10 shadow-md"
          style={{ backgroundImage: `url(${headerFooterPattern})` }}
        />
      )}
      
      <main className="flex-1 flex flex-col relative z-0 overflow-y-auto bg-white">
        {children}
      </main>
      
      {!hidePattern && (
        <div 
          className="h-20 w-full bg-cover bg-center shrink-0 z-10 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
          style={{ backgroundImage: `url(${headerFooterPattern})` }}
        />
      )}
    </div>
  );
}
