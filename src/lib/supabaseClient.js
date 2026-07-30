import { createClient } from '@supabase/supabase-js';

// Retrieve credentials strictly from Developer Environment (.env)
export function getSupabaseCredentials() {
  const url = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL) : '';
  const key = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY) : '';

  const isConfigured = Boolean(url && key && !url.includes('your-project-id') && !url.includes('YOUR_PROJECT_ID'));

  return { url, key, isConfigured };
}

let supabaseInstance = null;

export function getSupabaseClient() {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
}
