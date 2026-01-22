import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient | null {
  if (!ENV.isConfigured) {
    console.error('❌ Supabase not configured: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  try {
    return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
}

supabaseInstance = createSupabaseClient();

export const supabase = supabaseInstance!;
export const isSupabaseConfigured = ENV.isConfigured && supabaseInstance !== null;
