import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';

export function ProductsGrid() {
  const { t } = useI18n();
  const { products, filteredProducts, resetFilters, seedDemoData } = useCatalog();

  if (filteredProducts.length === 0) {
    if (products.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">🛋️</div>
          <h3 className="empty-state-title">{t('products.noProductsTitle')}</h3>
          <p className="empty-state-desc">{t('products.noProductsDesc')}</p>
          <button
            className="btn btn-accent btn-seed-demo"
            onClick={seedDemoData}
            style={{ marginTop: '16px' }}
          >
            {t('products.loadDemoBtn')}
          </button>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛋️</div>
        <h3 className="empty-state-title">{t('products.emptyTitle')}</h3>
        <p className="empty-state-desc">{t('products.emptyDesc')}</p>
        <button
          className="btn btn-secondary"
          onClick={resetFilters}
          style={{ marginTop: '16px' }}
        >
          {t('products.resetFilters')}
        </button>
      </div>
    );
  }

  return (
    <div className="products-grid" id="products-grid">
      {filteredProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
