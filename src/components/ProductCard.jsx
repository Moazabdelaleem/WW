import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function ProductCard({ product }) {
  const { tr, isAr } = useI18n();
  const { categories, productImages, openProductModal } = useCatalog();

  const imgs = productImages.filter(img => img.product_id === product.id);
  const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop';
  const mainImg = imgs[0]?.url || fallbackImg;

  const catObj = categories.find(c => c.id === product.category_id);
  const categoryName = tr(catObj ? catObj.name : 'Furniture');
  const productName = tr(product.name);
  const desc = tr(product.description || '');

  const formatPriceText = () => {
    if (product.price_type === 'on_request') return tr('Price on Request');
    const amountFormatted = (product.price || 0).toLocaleString('en-US');
    const currencyStr = isAr ? 'ج.م' : 'L.E.';
    const priceFormatted = `${amountFormatted} ${currencyStr}`;
    
    if (product.price_type === 'range') {
      return isAr ? `يبدأ من ${priceFormatted}` : `From ${priceFormatted}`;
    }
    return priceFormatted;
  };

  return (
    <div
      class={`product-card ${product.is_featured ? 'is-featured' : ''}`}
      onClick={() => openProductModal(product)}
    >
      <div class="product-card-img-wrapper">
        {product.is_featured && (
          <span class="product-badge-overlay badge badge-warning">★ Featured</span>
        )}
        
        <img
          class="product-card-img product-card-img-primary"
          src={mainImg}
          alt={productName}
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
      </div>

      <div class="product-card-content">
        <span class="product-card-category">{categoryName}</span>
        <h3 class="product-card-title">{productName}</h3>
        <p class="product-card-desc">{desc}</p>

        <div class="product-card-footer">
          <span class="product-card-price">{formatPriceText()}</span>
          {!product.is_available ? (
            <span class="badge badge-danger">{tr('Made to Order / Out of Stock')}</span>
          ) : (
            <span class="btn btn-secondary btn-sm">{tr('View Details →')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
