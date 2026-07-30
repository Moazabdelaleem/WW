import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { Globe, Sun, Moon } from 'lucide-react';

export function Header() {
  const { t, toggleLang } = useI18n();
  const { currentView, setCurrentView, theme, toggleTheme } = useCatalog();

  return (
    <header className="site-header">
      <div className="container header-container">
        <a 
          href="#catalog-section" 
          className="logo" 
          onClick={(e) => {
            e.preventDefault();
            if (e.detail === 3) {
              // Secret Triple Click on Logo opens Admin Portal
              setCurrentView(localStorage.getItem('LOCAL_ADMIN_AUTH') === 'true' ? 'admin-dashboard' : 'admin-login');
            } else {
              setCurrentView('catalog');
            }
          }}
          title="ArtisanWood Catalog"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Artisan<span>Wood</span>
        </a>
        
        <nav className="nav-links">
          {/* Theme Toggle Button (Dark / Light) */}
          <button
            id="theme-toggle-btn"
            className="btn btn-lang-toggle btn-sm"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun width="14" height="14" style={{ color: '#f59e0b' }} />
                <span>{t('nav.themeLight')}</span>
              </>
            ) : (
              <>
                <Moon width="14" height="14" style={{ color: '#6366f1' }} />
                <span>{t('nav.themeDark')}</span>
              </>
            )}
          </button>

          <button
            id="lang-toggle-btn"
            className="btn btn-lang-toggle btn-sm"
            onClick={toggleLang}
            aria-label="Switch language"
          >
            <Globe width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
            {t('nav.langToggle')}
          </button>

          <span
            id="local-mode-badge"
            className="badge badge-neutral"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '999px'
            }}
            title="Data is stored only in this browser — not shared with other visitors"
          >
            {t('nav.localBadge')}
          </span>

          <button
            className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('nav.catalog')}
          </button>

          <button
            className={`nav-link ${currentView === 'custom-request' ? 'active' : ''}`}
            onClick={() => setCurrentView('custom-request')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('nav.designYourOwn')}
          </button>
        </nav>
      </div>
    </header>
  );
}
