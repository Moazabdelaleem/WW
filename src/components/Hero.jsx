import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function Hero() {
  const { t } = useI18n();
  const { setCurrentView } = useCatalog();

  return (
    <section class="hero-section">
      <div class="container">
        <p class="hero-tag">{t('hero.tag')}</p>
        <h1 class="hero-title">{t('hero.title')}</h1>
        <p class="hero-subtitle">{t('hero.subtitle')}</p>
        <div class="hero-cta-group">
          <a
            href="#catalog-section"
            class="btn btn-primary btn-hero-dominant"
            onClick={() => setCurrentView('catalog')}
          >
            {t('hero.ctaBrowse')}
          </a>
          <button
            class="btn btn-outline-hero"
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
