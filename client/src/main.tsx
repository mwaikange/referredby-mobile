import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress MetaMask/Web3 wallet errors from browser extensions
// These errors can trigger the runtime error overlay even if the app doesn't use Web3
if (typeof window !== 'undefined') {
  const suppressWalletErrors = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error = event instanceof ErrorEvent ? event.error : (event as PromiseRejectionEvent).reason;
    const message = event instanceof ErrorEvent ? event.message : (error?.message || String(error));
    
    if (
      message?.includes('MetaMask') || 
      message?.includes('ethereum') || 
      message?.includes('wallet') ||
      error?.stack?.includes('chrome-extension')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('Suppressed external wallet error:', message);
    }
  };

  window.addEventListener('error', suppressWalletErrors, true);
  window.addEventListener('unhandledrejection', suppressWalletErrors, true);
}

// Startup environment check
console.log('========================================');
console.log('🔧 ENVIRONMENT CONFIGURATION CHECK');
console.log('========================================');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present ✅' : 'Missing ❌');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('========================================');

createRoot(document.getElementById("root")!).render(<App />);
