import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function AdminLoginPage() {
  const { t } = useI18n();
  const { loginAdmin, setCurrentView } = useCatalog();

  const [email, setEmail] = useState('admin@local.test');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e) => {
    e.preventDefault();
    loginAdmin(email, password);
  };

  return (
    <div className="admin-login-layout">
      <div className="login-card">
        <div className="login-header">
          <a href="#catalog" className="logo" onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Artisan<span>Wood</span>
          </a>
          <p className="login-subtitle">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="admin-demo-hint">
          <span>{t('login.localHint')} </span>
          <strong>admin@local.test</strong> / <strong>admin123</strong>.
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{t('login.emailLabel')}</label>
            <input
              type="email"
              id="login-email"
              className="input-text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t('login.passLabel')}</label>
            <input
              type="password"
              id="login-password"
              className="input-text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '14px' }}>
            {t('login.signInBtn')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentView('catalog')}
          >
            {t('custom.backToCatalog')}
          </button>
        </div>
      </div>
    </div>
  );
}
