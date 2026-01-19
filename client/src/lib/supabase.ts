import { createClient } from '@supabase/supabase-js';

// This is a Vite project, so we use import.meta.env.VITE_*
// We also check NEXT_PUBLIC_* just in case, though standard Vite requires VITE_ prefix.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://fxfhfnpexqzcohowfyvn.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_ANON_KEY) {
  console.error("CRITICAL: VITE_SUPABASE_ANON_KEY is missing. Authentication will fail. Please add this key to your Replit Secrets.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
