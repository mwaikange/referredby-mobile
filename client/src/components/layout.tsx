import { ReactNode } from "react";
import headerFooterPattern from "@assets/header_footer_1_(1)_1768528821576.png";

interface LayoutProps {
  children: ReactNode;
  hidePattern?: boolean;
}

export function Layout({ children, hidePattern = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[430px] mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      {!hidePattern && (
        <header className="shrink-0 z-20 w-full overflow-hidden">
          <img 
            src={headerFooterPattern} 
            alt="" 
            className="w-full h-auto block"
          />
        </header>
      )}
      
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto bg-white">
        <div className="responsive-container flex-1 flex flex-col py-6">
          {children}
        </div>
      </main>
      
      {!hidePattern && (
        <footer className="shrink-0 z-20 w-full overflow-hidden mt-auto">
          <img 
            src={headerFooterPattern} 
            alt="" 
            className="w-full h-auto block rotate-180"
          />
        </footer>
      )}
    </div>
  );
}
