import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const SUPABASE_URL = extra.supabaseUrl || '';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || '';
const API_BASE_URL = extra.apiBaseUrl || 'https://appv2.referredby.com.na';

export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  API_BASE_URL,
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
};

console.log('🔧 ENV Config:', {
  SUPABASE_URL: ENV.SUPABASE_URL ? 'Set' : 'Missing',
  SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  API_BASE_URL: ENV.API_BASE_URL,
  isConfigured: ENV.isConfigured,
});
