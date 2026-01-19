import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Startup environment check
console.log('========================================');
console.log('🔧 ENVIRONMENT CONFIGURATION CHECK');
console.log('========================================');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present ✅' : 'Missing ❌');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('========================================');

createRoot(document.getElementById("root")!).render(<App />);
