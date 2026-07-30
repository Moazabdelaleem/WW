import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env, window, or localStorage
export function getSupabaseCredentials() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL) : '';
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY) : '';

  let storedConfig = null;
  try {
    const raw = localStorage.getItem('SUPABASE_CONFIG');
    if (raw) storedConfig = JSON.parse(raw);
  } catch (e) {
    // Ignore JSON error
  }

  const url = storedConfig?.url || envUrl || '';
  const key = storedConfig?.key || envKey || '';

  const isConfigured = Boolean(url && key && !url.includes('your-project-id'));

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

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('SUPABASE_CONFIG', JSON.stringify({ url: url.trim(), key: key.trim() }));
  supabaseInstance = null; // Reset instance to recreate with new credentials
  return getSupabaseClient();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('SUPABASE_CONFIG');
  supabaseInstance = null;
}
