export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://appv2.referredby.com.na',
};

console.log('🔧 ENV Config:', {
  SUPABASE_URL: ENV.SUPABASE_URL ? 'Set' : 'Missing',
  SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  API_BASE_URL: ENV.API_BASE_URL,
});
