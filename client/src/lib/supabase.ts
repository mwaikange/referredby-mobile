import { createClient } from '@supabase/supabase-js';

// Helper to get env vars with support for various prefixes (VITE_, NEXT_PUBLIC_, EXPO_PUBLIC_)
// This ensures compatibility whether the user thinks it's Expo, Next.js, or Vite
const getEnvVar = (key: string, fallback = "") => {
  // 1. Try VITE_ prefix (Standard Vite)
  if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  
  // 2. Try NEXT_PUBLIC_ prefix (Common in web apps)
  if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];
  
  // 3. Try EXPO_PUBLIC_ prefix (Requested by user, might not be exposed in Vite without config)
  // @ts-ignore
  if (import.meta.env[`EXPO_PUBLIC_${key}`]) return import.meta.env[`EXPO_PUBLIC_${key}`];

  return fallback;
};

// Retrieve credentials using the helper
const SUPABASE_URL = getEnvVar("SUPABASE_URL", "https://fxfhfnpexqzcohowfyvn.supabase.co");
const SUPABASE_ANON_KEY = getEnvVar("SUPABASE_ANON_KEY");

// Validation check
if (!SUPABASE_ANON_KEY) {
  console.error("CRITICAL: Supabase credentials are missing. Please add VITE_SUPABASE_ANON_KEY to Replit Secrets.");
} else {
  console.log('✅ Supabase initialized with URL:', SUPABASE_URL);
}

// Create the client
// Note: We use default storage (localStorage) which is robust for web apps.
// AsyncStorage is for React Native and would break this web preview.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
