import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function Hero() {
  const { t } = useI18n();
  const { setCurrentView } = useCatalog();

  return (
    <section className="hero-section">
      <div className="container">
        <p className="hero-tag">{t('hero.tag')}</p>
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
        <div className="hero-cta-group">
          <a
            href="#catalog-section"
            className="btn btn-primary btn-hero-dominant"
            onClick={() => setCurrentView('catalog')}
          >
            {t('hero.ctaBrowse')}
          </a>
          <button
            className="btn btn-outline-hero"
            onClick={() => setCurrentView('custom-request')}
            style={{ cursor: 'pointer' }}
          >
            {t('hero.ctaUpload')}
          </button>
        </div>
      </div>
    </section>
  );
}
