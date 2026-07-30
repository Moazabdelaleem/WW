import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { X, Send, CheckCircle } from 'lucide-react';

export function ProductDrawerModal() {
  const { t, tr, isAr } = useI18n();
  const {
    selectedProduct,
    closeProductModal,
    categories,
    productImages,
    optionGroups,
    optionValues,
    submitOrder,
    showToast
  } = useCatalog();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Inline Validation Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Customization Options State: { [groupId]: { value, priceModifier, label } }
  const [selectedOptionsState, setSelectedOptionsState] = useState({});

  // Success Confirmation View State
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setCustomerName('');
      setPhone('');
      setNotes('');
      setNameError('');
      setPhoneError('');
      setIsSuccessSubmitted(false);
      
      // Initialize default option selections
      const productOg = optionGroups.filter(og => og.product_id === selectedProduct.id);
      const initialOpts = {};
      productOg.forEach(group => {
        const vals = optionValues.filter(ov => ov.option_group_id === group.id);
        if (group.type === 'numeric') {
          const min = group.min_value || 100;
          initialOpts[group.id] = {
            groupName: tr(group.name),
            value: min,
            unit: group.unit_label || '',
            priceModifier: 0
          };
        } else if (vals.length > 0) {
          const firstVal = vals[0];
          initialOpts[group.id] = {
            groupName: tr(group.name),
            value: firstVal.id,
            label: tr(firstVal.name),
            priceModifier: firstVal.price_modifier || 0
          };
        }
      });
      setSelectedOptionsState(initialOpts);
    }
  }, [selectedProduct, optionGroups, optionValues]);

  if (!selectedProduct) return null;

  const catObj = categories.find(c => c.id === selectedProduct.category_id);
  const categoryName = tr(catObj ? catObj.name : 'Furniture');
  const productName = tr(selectedProduct.name);
  const desc = tr(selectedProduct.description || '');

  const imgs = productImages.filter(img => img.product_id === selectedProduct.id);
  const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop';
  const mainImg = imgs[0]?.url || fallbackImg;

  const productOgList = optionGroups.filter(og => og.product_id === selectedProduct.id);

  // Calculate live total price in EGP
  const calculateTotal = () => {
    const base = parseFloat(selectedProduct.price) || 0;
    const optsExtra = Object.values(selectedOptionsState).reduce((sum, opt) => sum + (opt.priceModifier || 0), 0);
    return (base + optsExtra) * Math.max(1, quantity);
  };

  const currencyStr = isAr ? 'ج.م' : 'L.E.';
  const amountFormatted = calculateTotal().toLocaleString('en-US');
  const formattedTotalPrice = `${amountFormatted} ${currencyStr}`;

  const formatPriceDisplay = () => {
    if (selectedProduct.price_type === 'on_request') return tr('Price on Request');
    if (selectedProduct.price_type === 'range') {
      return isAr ? `يبدأ من ${formattedTotalPrice}` : `From ${formattedTotalPrice}`;
    }
    return formattedTotalPrice;
  };

  // Web Order Submit
  const handleWebOrderSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!customerName.trim()) {
      setNameError(t('detail.nameRequired'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (!phone.trim()) {
      setPhoneError(t('detail.nameRequired'));
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (hasError) {
      showToast(t('detail.nameRequired'), 'error');
      return;
    }

    const optsArray = Object.values(selectedOptionsState).map(opt => ({
      group: opt.groupName,
      value: opt.label || `${opt.value}${opt.unit ? ' ' + opt.unit : ''}`,
      price_modifier: opt.priceModifier
    }));

    submitOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      productId: selectedProduct.id,
      quantity,
      selectedOptions: optsArray,
      totalPrice: selectedProduct.price_type === 'on_request' ? null : calculateTotal()
    });

    setIsSuccessSubmitted(true);
    showToast(t('detail.successMsg'), 'success');
  };

  // WhatsApp Order Submit
  const handleWhatsAppOrder = () => {
    const selectedOptionsList = Object.values(selectedOptionsState).map(opt => 
      `${opt.groupName}: ${opt.label || (opt.value + (opt.unit ? ' ' + opt.unit : ''))}`
    );

    const priceText = selectedProduct.price_type === 'on_request' ? 'Price on Request' : formattedTotalPrice;

    let message = `Hello ArtisanWood! 👋\nI would like to order:\n\n` +
      `📌 *Product:* ${selectedProduct.name}\n` +
      `🔢 *Quantity:* ${quantity}\n` +
      `💰 *Estimated Total:* ${priceText}\n`;

    if (selectedOptionsList.length > 0) {
      message += `🎨 *Options:*\n - ${selectedOptionsList.join('\n - ')}\n`;
    }

    if (customerName.trim()) message += `\n👤 *Customer Name:* ${customerName.trim()}`;
    if (phone.trim()) message += `\n📞 *Phone:* ${phone.trim()}`;
    if (notes.trim()) message += `\n📝 *Notes:* ${notes.trim()}`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    showToast('Opening WhatsApp with pre-filled order details!', 'success');
  };

  return (
    <div class="product-drawer active" id="product-detail-modal">
      <div class="drawer-panel">

        {/* Sticky close bar */}
        <button class="drawer-close-btn" onClick={closeProductModal} aria-label="Close">
          <span class="drawer-close-label">{t('detail.close')}</span>
          <X width="18" height="18" />
        </button>

        {/* Stacked Image Gallery */}
        <div class="drawer-gallery">
          <div class="drawer-gallery-item drawer-gallery-item-main">
            <img
              src={mainImg}
              alt={productName}
              loading="eager"
              onError={(e) => { e.target.src = fallbackImg; }}
            />
          </div>
        </div>

        {/* Content */}
        <div class="drawer-content">
          <nav class="drawer-breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <a href="#catalog">{t('nav.catalog')}</a>
            <span class="breadcrumb-separator">›</span>
            <span>{categoryName}</span>
            <span class="breadcrumb-separator">›</span>
            <strong style={{ color: 'var(--primary-900)' }}>{productName}</strong>
          </nav>

          <span class="detail-category">{categoryName}</span>
          <h2 class="detail-title">{productName}</h2>

          <div class="detail-price-box">
            <span class="detail-price">{formatPriceDisplay()}</span>
            <span class="detail-price-type">({selectedProduct.price_type})</span>
          </div>

          <div class="detail-status">
            {selectedProduct.is_available ? (
              <span class="badge badge-success">{tr('Currently Available')}</span>
            ) : (
              <span class="badge badge-danger">{tr('Made to Order / Out of Stock')}</span>
            )}
          </div>

          {/* Option Swatches & Steppers */}
          {productOgList.length > 0 && (
            <div id="detail-options-container" style={{ marginTop: '16px' }}>
              {productOgList.map(group => {
                const vals = optionValues.filter(ov => ov.option_group_id === group.id);
                if (group.type === 'numeric') {
                  const min = group.min_value || 100;
                  const max = group.max_value || 240;
                  const step = group.step || 10;
                  const currentVal = selectedOptionsState[group.id]?.value || min;

                  return (
                    <div key={group.id} class="option-swatch-group">
                      <span class="option-group-title">{tr(group.name)}</span>
                      <div class="numeric-stepper">
                        <button
                          type="button"
                          class="stepper-btn"
                          onClick={() => {
                            const next = Math.max(min, currentVal - step);
                            setSelectedOptionsState(prev => ({
                              ...prev,
                              [group.id]: {
                                groupName: tr(group.name),
                                value: next,
                                unit: group.unit_label || '',
                                priceModifier: (next - min) * (group.price_per_unit || 0)
                              }
                            }));
                          }}
                        >–</button>
                        <span class="stepper-value">{currentVal}{group.unit_label ? ' ' + tr(group.unit_label) : ''}</span>
                        <button
                          type="button"
                          class="stepper-btn"
                          onClick={() => {
                            const next = Math.min(max, currentVal + step);
                            setSelectedOptionsState(prev => ({
                              ...prev,
                              [group.id]: {
                                groupName: tr(group.name),
                                value: next,
                                unit: group.unit_label || '',
                                priceModifier: (next - min) * (group.price_per_unit || 0)
                              }
                            }));
                          }}
                        >+</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={group.id} class="option-swatch-group">
                    <span class="option-group-title">{tr(group.name)}</span>
                    <div>
                      {vals.map(val => {
                        const isSelected = selectedOptionsState[group.id]?.value === val.id;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            class={`option-value-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedOptionsState(prev => ({
                                ...prev,
                                [group.id]: {
                                  groupName: tr(group.name),
                                  value: val.id,
                                  label: tr(val.name),
                                  priceModifier: val.price_modifier || 0
                                }
                              }));
                            }}
                          >
                            {tr(val.name || '') || tr(val.label || '') || val.name || 'Option'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h3 class="detail-desc-title" style={{ marginTop: '16px' }}>{t('detail.description')}</h3>
          <p class="detail-desc">{desc}</p>

          {/* Order Request Form */}
          <div class="order-request-form">
            <div class="form-group">
              <label class="form-label" for="order-quantity">{t('detail.quantity')}</label>
              <input
                type="number"
                id="order-quantity"
                class="input-text"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ maxWidth: '100px' }}
              />
            </div>

            {!isSuccessSubmitted ? (
              <>
                <div id="order-form-fields">
                  <div class="form-group">
                    <label class="form-label" for="order-customer-name">{t('detail.yourName')}</label>
                    <input
                      type="text"
                      id="order-customer-name"
                      class="input-text"
                      placeholder={t('detail.namePlaceholder')}
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      required
                    />
                    {nameError && (
                      <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {nameError}
                      </span>
                    )}
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="order-customer-phone">{t('detail.phone')}</label>
                    <input
                      type="tel"
                      id="order-customer-phone"
                      class="input-text"
                      placeholder={t('detail.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      required
                    />
                    {phoneError && (
                      <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {phoneError}
                      </span>
                    )}
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="order-customer-notes">{t('detail.notes')}</label>
                    <textarea
                      id="order-customer-notes"
                      class="form-textarea"
                      placeholder={t('detail.notesPlaceholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 12px' }}>
                  {t('detail.disclaimer')}
                </p>

                <div class="order-actions-grid">
                  <div class="action-btn-wrapper">
                    <button
                      type="button"
                      class="btn btn-primary btn-order-primary"
                      onClick={handleWebOrderSubmit}
                    >
                      {t('detail.requestBtn')}
                    </button>
                    <span class="btn-action-hint">{t('detail.requestHint')}</span>
                  </div>

                  <div class="action-btn-wrapper">
                    <button
                      type="button"
                      class="btn-whatsapp btn-order-whatsapp"
                      onClick={handleWhatsAppOrder}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: 'currentColor' }}>
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>{t('detail.whatsappBtn')}</span>
                    </button>
                    <span class="btn-action-hint">{t('detail.whatsappHint')}</span>
                  </div>
                </div>
              </>
            ) : (
              <div
                id="order-success-msg"
                style={{
                  display: 'block',
                  marginTop: '16px',
                  padding: '18px',
                  background: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {t('detail.successMsg')}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
