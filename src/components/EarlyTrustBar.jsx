import React from 'react';
import { useI18n } from '../context/I18nContext';
import { Truck, TreePine, Ruler, MessageSquare } from 'lucide-react';

export function EarlyTrustBar() {
  const { t } = useI18n();

  return (
    <div class="hero-trust-bar">
      <div class="container hero-trust-container">
        <div class="hero-trust-item">
          <div class="trust-icon">
            <Truck width="20" height="20" />
          </div>
          <div>
            <strong class="trust-title">{t('footer.trustDeliveryTitle')}</strong>
            <span class="trust-subtitle">{t('footer.trustDeliverySub')}</span>
          </div>
        </div>

        <div class="hero-trust-item">
          <div class="trust-icon">
            <TreePine width="20" height="20" />
          </div>
          <div>
            <strong class="trust-title">{t('footer.trustWoodTitle')}</strong>
            <span class="trust-subtitle">{t('footer.trustWoodSub')}</span>
          </div>
        </div>

        <div class="hero-trust-item">
          <div class="trust-icon">
            <Ruler width="20" height="20" />
          </div>
          <div>
            <strong class="trust-title">{t('footer.trustCustomTitle')}</strong>
            <span class="trust-subtitle">{t('footer.trustCustomSub')}</span>
          </div>
        </div>

        <div class="hero-trust-item">
          <div class="trust-icon">
            <MessageSquare width="20" height="20" />
          </div>
          <div>
            <strong class="trust-title">{t('footer.trustSupportTitle')}</strong>
            <span class="trust-subtitle">{t('footer.trustSupportSub')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
