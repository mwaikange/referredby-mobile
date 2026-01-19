import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Validation check
if (!ENV.SUPABASE_ANON_KEY) {
  console.error("CRITICAL: Supabase credentials are missing. Please check your Replit Secrets.");
} else {
  console.log('✅ Initializing Supabase with URL:', ENV.SUPABASE_URL);
}

// Create the client
// Note: We use default storage (localStorage) which is robust for web apps.
// AsyncStorage is for React Native and would break this web preview.
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
  },
});
