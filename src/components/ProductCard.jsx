import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function ProductCard({ product, index }) {
  const { t, tr } = useI18n();
  const { categories, productImages, openProductModal } = useCatalog();

  const imgs = productImages.filter(img => img.product_id === product.id);
  const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop';
  const primaryImg = imgs[0]?.url || fallbackImg;
  const secondaryImg = imgs[1]?.url || null;

  const catObj = categories.find(c => c.id === product.category_id);
  const categoryName = tr(catObj ? catObj.name : 'Furniture');
  const productName = tr(product.name);
  const desc = tr(product.description || '');

  const formatPriceText = () => {
    if (product.price_type === 'on_request') return t('common.onRequest');
    const priceFormatted = `$${(product.price || 0).toLocaleString()}`;
    if (product.price_type === 'range') return t('common.fromPrice', { p: priceFormatted });
    return priceFormatted;
  };

  return (
    <div
      class={`product-card reveal-card ${product.is_featured ? 'is-featured' : ''}`}
      style={{ '--reveal-delay': `${Math.min(index * 55, 400)}ms` }}
      onClick={() => openProductModal(product)}
    >
      <div class="product-card-img-wrapper">
        {product.is_featured && (
          <span class="product-card-featured-tag">★ Featured</span>
        )}
        
        <img
          class="product-card-img product-card-img-primary"
          src={primaryImg}
          alt={productName}
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        
        {secondaryImg && (
          <img
            class="product-card-img product-card-img-secondary"
            src={secondaryImg}
            alt={productName}
            loading="lazy"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        )}

        <div class="product-card-overlay">
          <span class="product-card-category-overlay">{categoryName}</span>
          <p class="product-card-desc-overlay">{desc}</p>
          <span class="product-card-view-btn">{t('View Details →')}</span>
        </div>
      </div>

      <div class="product-card-base">
        <div>
          <h3 class="product-card-title">{productName}</h3>
          <span class="product-card-price">{formatPriceText()}</span>
        </div>
        {!product.is_available && (
          <span class="badge badge-danger" style={{ fontSize: '10px' }}>
            {t('Made to Order')}
          </span>
        )}
      </div>
    </div>
  );
}
