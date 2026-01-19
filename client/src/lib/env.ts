// Environment variable helper
// Checks multiple prefixes to support both Vite (Web Preview) and Expo (Production APK)

export const ENV = {
  // Helper to check multiple prefixes
  get: (key: string, fallback = ""): string => {
    // 1. Try VITE_ prefix (Standard Vite - Web Preview)
    if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    
    // 2. Try EXPO_PUBLIC_ prefix (Expo - Production APK)
    // @ts-ignore
    if (import.meta.env[`EXPO_PUBLIC_${key}`]) return import.meta.env[`EXPO_PUBLIC_${key}`];
    
    // 3. Try NEXT_PUBLIC_ prefix (Fallback)
    if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];

    return fallback;
  },

  // Specific keys
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  API_BASE_URL: "",
};

// Initialize values
ENV.SUPABASE_URL = ENV.get("SUPABASE_URL", "https://fxfhfnpexqzcohowfyvn.supabase.co");
ENV.SUPABASE_ANON_KEY = ENV.get("SUPABASE_ANON_KEY");
ENV.API_BASE_URL = ENV.get("API_BASE_URL", "https://appv2.referredby.com.na");

// Debug logging
console.log("----------------------------------------");
console.log("📱 ENVIRONMENT CONFIGURATION LOADED");
console.log("----------------------------------------");
console.log(`API_BASE_URL:      ${ENV.API_BASE_URL}`);
console.log(`SUPABASE_URL:      ${ENV.SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY: ${ENV.SUPABASE_ANON_KEY ? "Set (Hidden)" : "MISSING ❌"}`);
console.log("----------------------------------------");
