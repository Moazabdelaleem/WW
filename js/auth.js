// auth.js
// Handles administrative authentication and database setup configuration.

import { getSupabaseClient, isSupabaseConfigured, isUsingLocalMode, saveSupabaseConfig, supabaseUrl } from './supabaseClient.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './localBackend.js';

// --- DOM Elements ---
const loginForm = document.getElementById('admin-login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const submitBtn = document.getElementById('login-submit-btn');
const feedbackMsg = document.getElementById('login-feedback');

// Config Modal
const triggerSetupBtn = document.getElementById('trigger-setup-modal');
const supabaseConfigModal = document.getElementById('supabase-config-modal');
const closeConfigModalBtn = document.getElementById('close-config-modal');
const configSetupForm = document.getElementById('config-setup-form');
const configUrlInput = document.getElementById('config-url');
const configAnonKeyInput = document.getElementById('config-anon-key');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  showLocalModeHintIfNeeded();

  // A client is always available (real Supabase, or the local fallback).
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (data?.session) {
      // Already logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  }

  setupEventListeners();
});

function showLocalModeHintIfNeeded() {
  const hint = document.getElementById('local-mode-hint');
  if (!hint) return;
  if (isUsingLocalMode()) {
    document.getElementById('local-mode-email').textContent = DEFAULT_ADMIN_EMAIL;
    document.getElementById('local-mode-password').textContent = DEFAULT_ADMIN_PASSWORD;
    hint.style.display = 'block';
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  // Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Config setup triggers
  if (triggerSetupBtn) {
    triggerSetupBtn.addEventListener('click', () => {
      // Pre-fill inputs with current localStorage values if they exist
      configUrlInput.value = localStorage.getItem('SUPABASE_URL') || '';
      configAnonKeyInput.value = localStorage.getItem('SUPABASE_ANON_KEY') || '';
      supabaseConfigModal.classList.add('active');
    });
  }

  if (closeConfigModalBtn) {
    closeConfigModalBtn.addEventListener('click', () => {
      supabaseConfigModal.classList.remove('active');
    });
  }

  if (configSetupForm) {
    configSetupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = configUrlInput.value;
      const key = configAnonKeyInput.value;
      saveSupabaseConfig(url, key);
    });
  }
}

// --- Login Handler ---
async function handleLogin(e) {
  e.preventDefault();
  
  if (!isSupabaseConfigured()) {
    showFeedback("Database not connected. Please click the link below to configure.", "error");
    showConfigModal();
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    setLoadingState(true);
    hideFeedback();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    showFeedback("Logged in successfully! Redirecting...", "success");
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    console.error("Login error:", error.message);
    showFeedback(`Authentication failed: ${error.message}`, "error");
    setLoadingState(false);
  }
}

// --- UI Helpers ---
function showConfigModal() {
  if (supabaseConfigModal) {
    supabaseConfigModal.classList.add('active');
  }
}

function setLoadingState(isLoading) {
  if (!submitBtn) return;
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner spinner-light"></div>';
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Sign In</span>';
  }
}

function showFeedback(message, type) {
  if (!feedbackMsg) return;
  
  feedbackMsg.textContent = message;
  feedbackMsg.className = 'feedback-message'; // reset
  
  if (type === 'error') {
    feedbackMsg.classList.add('feedback-error');
  } else if (type === 'success') {
    feedbackMsg.classList.add('feedback-success');
  }
}

function hideFeedback() {
  if (feedbackMsg) {
    feedbackMsg.textContent = '';
    feedbackMsg.className = 'feedback-message';
    feedbackMsg.style.display = 'none';
  }
}
