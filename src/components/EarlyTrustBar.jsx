import React from 'react';
import { useI18n } from '../context/I18nContext';
import { Truck, TreePine, Ruler, MessageSquare } from 'lucide-react';

export function EarlyTrustBar() {
  const { t } = useI18n();

  return (
    <div className="hero-trust-bar">
      <div className="container hero-trust-container">
        <div className="hero-trust-item">
          <div className="trust-icon">
            <Truck width="20" height="20" />
          </div>
          <div>
            <strong className="trust-title">{t('footer.trustDeliveryTitle')}</strong>
            <span className="trust-subtitle">{t('footer.trustDeliverySub')}</span>
          </div>
        </div>

        <div className="hero-trust-item">
          <div className="trust-icon">
            <TreePine width="20" height="20" />
          </div>
          <div>
            <strong className="trust-title">{t('footer.trustWoodTitle')}</strong>
            <span className="trust-subtitle">{t('footer.trustWoodSub')}</span>
          </div>
        </div>

        <div className="hero-trust-item">
          <div className="trust-icon">
            <Ruler width="20" height="20" />
          </div>
          <div>
            <strong className="trust-title">{t('footer.trustCustomTitle')}</strong>
            <span className="trust-subtitle">{t('footer.trustCustomSub')}</span>
          </div>
        </div>

        <div className="hero-trust-item">
          <div className="trust-icon">
            <MessageSquare width="20" height="20" />
          </div>
          <div>
            <strong className="trust-title">{t('footer.trustSupportTitle')}</strong>
            <span className="trust-subtitle">{t('footer.trustSupportSub')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
