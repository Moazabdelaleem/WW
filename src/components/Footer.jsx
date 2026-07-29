import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { MapPin, Phone, MessageSquare, Mail } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();
  const { setCurrentView } = useCatalog();

  return (
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          {/* Col 1: Workshop Brand */}
          <div class="footer-brand">
            <a
              href="#catalog"
              class="logo"
              onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Artisan<span>Wood</span>
            </a>
            <p class="footer-desc">{t('footer.brandDesc')}</p>
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              <strong style={{ color: '#ffffff' }}>{t('footer.hoursLabel')}</strong> {t('footer.hoursVal')}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 class="footer-col-title">{t('footer.quickLinksTitle')}</h4>
            <ul class="footer-links-list">
              <li>
                <a
                  href="#catalog"
                  onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }}
                >
                  {t('nav.catalog')}
                </a>
              </li>
              <li>
                <a
                  href="#custom-request"
                  onClick={(e) => { e.preventDefault(); setCurrentView('custom-request'); }}
                >
                  {t('nav.designYourOwn')}
                </a>
              </li>
              <li>
                <a href="https://wa.me/?text=Hello%20ArtisanWood!" target="_blank" rel="noreferrer">
                  {t('footer.linkWhatsApp')}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div>
            <h4 class="footer-col-title">{t('footer.contactTitle')}</h4>
            <div class="footer-contact-list">
              <div class="contact-item">
                <span class="contact-item-icon"><MapPin width="15" height="15" /></span>
                <span>{t('footer.addressVal')}</span>
              </div>
              <div class="contact-item">
                <span class="contact-item-icon"><Phone width="15" height="15" /></span>
                <div>
                  <a href="tel:+201000000000">0100 000 0000</a> / <a href="tel:+201200000000">0120 000 0000</a>
                </div>
              </div>
              <div class="contact-item">
                <span class="contact-item-icon"><MessageSquare width="15" height="15" /></span>
                <a href="https://wa.me/?text=Hello%20ArtisanWood!" target="_blank" rel="noreferrer">
                  {t('footer.whatsappChat')}
                </a>
              </div>
              <div class="contact-item">
                <span class="contact-item-icon"><Mail width="15" height="15" /></span>
                <a href="mailto:info@artisanwood-demo.com">info@artisanwood-demo.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div class="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.taglineSub')}</p>
        </div>
      </div>
    </footer>
  );
}
