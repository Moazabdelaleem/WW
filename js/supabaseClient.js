// supabaseClient.js
// Handles initialization of the data client used across the app.
//
// Two modes:
//   1. Real Supabase — used automatically once valid project credentials
//      are hardcoded below or saved via "Configure Database Connection".
//   2. Local demo mode (default) — no credentials configured, so the app
//      runs entirely against js/localBackend.js (localStorage). Zero setup,
//      but data lives only in this browser and is NOT shared between
//      visitors. Do not treat local mode as a live deployment for real
//      customers — see js/localBackend.js for details.

import { createLocalClient } from './localBackend.js';

// 1. Production Credentials
// You can hardcode your credentials here, and they will take precedence.
const PROD_SUPABASE_URL = "";
const PROD_SUPABASE_ANON_KEY = "";

let supabaseUrl = PROD_SUPABASE_URL || localStorage.getItem('SUPABASE_URL');
let supabaseAnonKey = PROD_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY');

let supabaseClientInstance = null;
let localClientInstance = null;
let usingLocalMode = false;

// Helper to check if credentials are valid placeholder or empty
function isValidCredential(value) {
  return value && value.trim() !== "" && !value.includes("your-project-id");
}

function tryInitRealClient() {
  if (isValidCredential(supabaseUrl) && isValidCredential(supabaseAnonKey)) {
    if (window.supabase) {
      try {
        return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      } catch (error) {
        console.error("Error creating Supabase client:", error);
      }
    } else {
      console.error("Supabase CDN library not loaded yet.");
    }
  }
  return null;
}

supabaseClientInstance = tryInitRealClient();

/**
 * Returns the active data client instance: a real Supabase client if
 * configured, otherwise the local in-browser fallback (always available).
 */
export function getSupabaseClient() {
  if (!supabaseClientInstance) {
    supabaseUrl = PROD_SUPABASE_URL || localStorage.getItem('SUPABASE_URL');
    supabaseAnonKey = PROD_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY');
    supabaseClientInstance = tryInitRealClient();
  }

  if (supabaseClientInstance) {
    usingLocalMode = false;
    return supabaseClientInstance;
  }

  if (!localClientInstance) {
    localClientInstance = createLocalClient();
  }
  usingLocalMode = true;
  return localClientInstance;
}

/**
 * Always true — a client (real or local) is always available. Kept for
 * backwards compatibility with existing call sites.
 */
export function isSupabaseConfigured() {
  return getSupabaseClient() !== null;
}

/**
 * True when running against the local in-browser backend rather than a
 * real Supabase project.
 */
export function isUsingLocalMode() {
  getSupabaseClient();
  return usingLocalMode;
}

/**
 * Saves the Supabase configuration credentials to local storage and
 * switches the app over to the real project on reload.
 */
export function saveSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('SUPABASE_URL', url.trim());
    localStorage.setItem('SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  }
}

/**
 * Clears any saved real-Supabase credentials, dropping the app back to
 * local demo mode on reload.
 */
export function clearSupabaseConfig() {
  localStorage.removeItem('SUPABASE_URL');
  localStorage.removeItem('SUPABASE_ANON_KEY');
  window.location.reload();
}

// Default export of the client (may be null before first getSupabaseClient() call)
export default supabaseClientInstance;
export { supabaseUrl };
