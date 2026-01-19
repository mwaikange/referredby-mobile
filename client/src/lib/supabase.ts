import { createClient } from '@supabase/supabase-js';

// These should ideally be in environment variables
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fxfhfnpexqzcohowfyvn.supabase.co";
// Use a fallback empty string or dummy key to prevent crash if env var is missing
// The auth calls will fail, but the app won't crash on startup
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.key"; 

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase Anon Key is missing. Please add VITE_SUPABASE_ANON_KEY to your environment variables or Secrets. Using dummy key to prevent crash.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
