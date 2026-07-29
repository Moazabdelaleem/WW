import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { ShieldCheck, Globe } from 'lucide-react';

export function Header() {
  const { t, toggleLang } = useI18n();
  const { currentView, setCurrentView } = useCatalog();

  return (
    <header class="site-header">
      <div class="container header-container">
        <a 
          href="#catalog-section" 
          class="logo" 
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('catalog');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Artisan<span>Wood</span>
        </a>
        
        <nav class="nav-links">
          <button
            id="lang-toggle-btn"
            class="btn btn-lang-toggle btn-sm"
            onClick={toggleLang}
            aria-label="Switch language"
          >
            <Globe width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
            {t('nav.langToggle')}
          </button>

          <span
            id="local-mode-badge"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              background: '#eef2ff',
              color: '#3730a3',
              padding: '3px 9px',
              borderRadius: '999px'
            }}
            title="Data is stored only in this browser — not shared with other visitors"
          >
            {t('nav.localBadge')}
          </span>

          <button
            class={`nav-link ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('nav.catalog')}
          </button>

          <button
            class={`nav-link ${currentView === 'custom-request' ? 'active' : ''}`}
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
