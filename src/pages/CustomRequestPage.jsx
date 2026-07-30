import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { Camera, CheckCircle } from 'lucide-react';

export function CustomRequestPage() {
  const { t, tr } = useI18n();
  const { categories, submitCustomRequest, showToast, setCurrentView } = useCatalog();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Inline Validation
  const [descError, setDescError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  const materialsList = ['Oak', 'Walnut', 'Pine', 'Linen', 'Velvet', 'Leather', 'Metal accents'];

  const toggleMaterial = (mat) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const handleFile = (file) => {
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!description.trim()) {
      setDescError(t('detail.nameRequired'));
      hasError = true;
    } else {
      setDescError('');
    }

    if (!name.trim()) {
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

    submitCustomRequest({
      category: selectedCategory || null,
      description: description.trim(),
      dimensions_note: dimensions.trim() || null,
      materials_note: selectedMaterials.length ? selectedMaterials.join(', ') : null,
      reference_note: uploadedFile ? `Reference Photo (${uploadedFile.name}): ${uploadedPreview}` : null,
      customer_name: name.trim(),
      phone: phone.trim()
    });

    setIsSuccess(true);
    showToast(t('custom.successTitle'), 'success');
  };

  const handleWhatsAppSubmit = () => {
    if (!description.trim()) {
      setDescError(t('detail.nameRequired'));
      showToast('Please describe what you are picturing before sending via WhatsApp.', 'error');
      return;
    }

    let message = `Hello! 👋\nI have a custom furniture request:\n\n` +
      `📌 *Category:* ${selectedCategory || 'Custom Design'}\n` +
      `📝 *Description:* ${description.trim()}\n`;

    if (dimensions.trim()) message += `📐 *Dimensions:* ${dimensions.trim()}\n`;
    if (selectedMaterials.length) message += `🪵 *Materials:* ${selectedMaterials.join(', ')}\n`;
    if (uploadedFile) message += `🖼️ *Photo:* ${uploadedFile.name}\n`;
    if (name.trim()) message += `\n👤 *Name:* ${name.trim()}`;
    if (phone.trim()) message += `\n📞 *Phone:* ${phone.trim()}`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    showToast('Opening WhatsApp with your pre-filled design request!', 'success');
  };

  return (
    <>
      {/* Hero */}
      <section class="hero-section">
        <div class="container">
          <p class="hero-tag">{t('custom.heroTag')}</p>
          <h1 class="hero-title">{t('custom.heroTitle')}</h1>
          <p class="hero-subtitle">{t('custom.heroSubtitle')}</p>
        </div>
      </section>

      {/* Form Section */}
      <section class="section-padding" style={{ padding: '60px 0' }}>
        <div class="container" style={{ maxWidth: '640px' }}>
          {isSuccess ? (
            <div id="custom-request-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle width="48" height="48" style={{ color: 'var(--success)', margin: '0 auto' }} />
              <h2 style={{ margin: '12px 0 8px' }}>{t('custom.successTitle')}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{t('custom.successMsg')}</p>
              <button
                class="btn btn-secondary"
                style={{ marginTop: '20px', display: 'inline-block' }}
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentView('catalog');
                }}
              >
                {t('custom.backToCatalog')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* 1. Category */}
              <div class="form-group">
                <label class="form-label">{t('custom.startingPoint')}</label>
                <ul
                  class="category-filter-list"
                  style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px' }}
                >
                  <li
                    class={`category-filter-item ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('')}
                  >
                    <span>{t('custom.noCategory')}</span>
                  </li>
                  {categories.map(cat => (
                    <li
                      key={cat.id}
                      class={`category-filter-item ${selectedCategory === cat.name ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      <span>{tr(cat.name)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Description */}
              <div class="form-group">
                <label class="form-label" for="custom-description">{t('custom.descLabel')}</label>
                <textarea
                  id="custom-description"
                  class="form-textarea"
                  placeholder={t('custom.descPlaceholder')}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (descError) setDescError('');
                  }}
                  required
                ></textarea>
                {descError && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                    {descError}
                  </span>
                )}
              </div>

              {/* 2b. Size */}
              <div class="form-group">
                <label class="form-label" for="custom-dimensions">{t('custom.sizeLabel')}</label>
                <input
                  type="text"
                  id="custom-dimensions"
                  class="input-text"
                  placeholder={t('custom.sizePlaceholder')}
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>

              {/* 3. Materials */}
              <div class="form-group">
                <label class="form-label">{t('custom.materialsLabel')}</label>
                <div class="option-swatch-group" style={{ marginBottom: 0 }}>
                  {materialsList.map(mat => (
                    <button
                      key={mat}
                      type="button"
                      class={`option-value-btn ${selectedMaterials.includes(mat) ? 'selected' : ''}`}
                      onClick={() => toggleMaterial(mat)}
                    >
                      {tr(mat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Reference upload */}
              <div class="form-group">
                <label class="form-label">{t('custom.refLabel')}</label>
                <div
                  class="image-upload-zone"
                  onClick={() => document.getElementById('custom-file-input').click()}
                  style={{ cursor: 'pointer' }}
                >
                  <div class="upload-icon"><Camera width="32" height="32" /></div>
                  <p class="upload-text">{t('custom.refUploadText')}</p>
                  <p class="upload-hint">{t('custom.refUploadHint')}</p>
                  <input
                    type="file"
                    id="custom-file-input"
                    class="hidden-file-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
                    }}
                    style={{ display: 'none' }}
                  />
                </div>

                {uploadedPreview && (
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
                    <img
                      src={uploadedPreview}
                      alt="Reference preview"
                      style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '110px' }}>
                      {uploadedFile?.name}
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Contact info */}
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="custom-name">{t('custom.nameLabel')}</label>
                  <input
                    type="text"
                    id="custom-name"
                    class="input-text"
                    placeholder={t('custom.namePlaceholder')}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
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
                  <label class="form-label" for="custom-phone">{t('custom.phoneLabel')}</label>
                  <input
                    type="tel"
                    id="custom-phone"
                    class="input-text"
                    placeholder={t('custom.phonePlaceholder')}
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
              </div>

              <div class="order-actions-grid" style={{ marginTop: '16px' }}>
                <button type="submit" class="btn btn-accent" style={{ width: '100%' }}>
                  {t('custom.submitBtn')}
                </button>
                <button
                  type="button"
                  class="btn-whatsapp"
                  onClick={handleWhatsAppSubmit}
                  style={{ width: '100%' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: 'currentColor' }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>{t('custom.whatsappBtn')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
