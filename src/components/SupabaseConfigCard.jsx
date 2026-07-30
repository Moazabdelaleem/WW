import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Database, CheckCircle, AlertCircle, RefreshCw, Key, ExternalLink } from 'lucide-react';

export function SupabaseConfigCard() {
  const {
    isSupabaseConnected,
    isSyncing,
    loadFromSupabase,
    seedSupabaseDatabase,
    saveSupabaseConfig,
    clearSupabaseConfig,
    getSupabaseCredentials,
    showToast
  } = useCatalog();

  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url || '');
  const [key, setKey] = useState(creds.key || '');
  const [isEditing, setIsEditing] = useState(!isSupabaseConnected);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      showToast('Please enter both Supabase URL and Anon Key.', 'error');
      return;
    }

    setIsTesting(true);
    saveSupabaseConfig(url, key);
    const connected = await loadFromSupabase();
    setIsTesting(false);

    if (connected) {
      showToast('Connected to Supabase database successfully!', 'success');
      setIsEditing(false);
    } else {
      showToast('Could not query Supabase. Check your URL/Key or run SQL migrations.', 'error');
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setIsEditing(true);
    showToast('Cleared Supabase credentials. Reverted to Local Demo Mode.', 'info');
  };

  return (
    <div style={{
      background: '#ffffff',
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '30px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={22} style={{ color: isSupabaseConnected ? '#10b981' : 'var(--accent-600)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--primary-900)' }}>
              Supabase Database Connection
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isSupabaseConnected ? 'Connected & Live' : 'Not Connected (Local Demo Mode active)'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSupabaseConnected ? (
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} /> Live Supabase DB
            </span>
          ) : (
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> Local Demo Mode
            </span>
          )}
        </div>
      </div>

      {!isEditing && isSupabaseConnected ? (
        <div>
          <div style={{ fontSize: '13px', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', wordBreak: 'break-all' }}>
            <strong>Project URL:</strong> {creds.url}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <Key size={14} /> Edit Credentials
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={seedSupabaseDatabase}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} /> Seed Database with Demo Data
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDisconnect}
            >
              Disconnect DB
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Enter your Supabase Project URL and Anon Public Key below to connect your real database tables (`categories`, `products`, `orders`, etc.).
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Project URL *</label>
            <input
              type="url"
              className="input-text"
              placeholder="https://xyzproject.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Public Key *</label>
            <input
              type="password"
              className="input-text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTesting}
            >
              {isTesting ? 'Testing Connection...' : 'Save & Connect Supabase'}
            </button>

            {isSupabaseConnected && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong>💡 Setup Checklist:</strong> Make sure you run `supabase/schema.sql` and `supabase/schema_orders_and_options.sql` in your Supabase SQL Editor first.
          </div>
        </form>
      )}
    </div>
  );
}
