// Environment variable helper
// Checks multiple prefixes to support both Vite (Web Preview) and Expo (Production APK)

// Safe process access for browser environment
const getProcessEnv = (key: string) => {
  try {
    // @ts-ignore
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || getProcessEnv('EXPO_PUBLIC_SUPABASE_URL') || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || getProcessEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || getProcessEnv('EXPO_PUBLIC_API_BASE_URL') || 'https://appv2.referredby.com.na',
};
