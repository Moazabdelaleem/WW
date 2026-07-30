import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { getSupabaseClient } from '../lib/supabaseClient';
import { autoTranslateText } from '../lib/translator';
import { Package, FolderTree, ShoppingBag, MessageSquareQuote, LogOut, Plus, Edit2, Trash2, X, Check, Search, Upload } from 'lucide-react';

export function AdminDashboardPage() {
  const { t, tr } = useI18n();
  const {
    products,
    categories,
    productImages,
    orders,
    customRequests,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    deleteOrder,
    updateCustomRequestStatus,
    deleteCustomRequest,
    logoutAdmin,
    setCurrentView,
    showToast
  } = useCatalog();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'orders' | 'requests'
  const [adminSearch, setAdminSearch] = useState('');

  // Category Add/Edit State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Product Add/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [prodForm, setProdForm] = useState({
    name: '',
    category_id: '',
    price: '',
    price_type: 'fixed',
    description: '',
    is_available: true,
    is_featured: false,
    image_url: ''
  });

  const outOfStockCount = products.filter(p => !p.is_available).length;

  // Open Product Modal for Create
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdForm({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      price_type: 'fixed',
      description: '',
      is_available: true,
      is_featured: false,
      image_url: ''
    });
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Edit
  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const existingImg = productImages.find(i => i.product_id === prod.id);

    setProdForm({
      name: tr(prod.name) || (typeof prod.name === 'object' ? prod.name.en || prod.name.ar : prod.name) || '',
      category_id: prod.category_id || (categories[0]?.id || ''),
      price: prod.price !== null && prod.price !== undefined ? prod.price : '',
      price_type: prod.price_type || 'fixed',
      description: tr(prod.description) || (typeof prod.description === 'object' ? prod.description.en || prod.description.ar : prod.description) || '',
      is_available: prod.is_available ?? true,
      is_featured: prod.is_featured ?? false,
      image_url: existingImg?.url || ''
    });
    setIsProductModalOpen(true);
  };

  // Handle File Upload (Drag/Select)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      
      const client = getSupabaseClient();
      if (client) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await client.storage.from('product-images').upload(filePath, file);

          if (!uploadError) {
            const { data: publicUrlData } = client.storage.from('product-images').getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              setProdForm(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
              setIsUploading(false);
              showToast('Image uploaded to Supabase Storage!', 'success');
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase Storage upload fallback to Data URL:', err);
        }
      }

      setProdForm(prev => ({ ...prev, image_url: dataUrl }));
      setIsUploading(false);
      showToast('Product photo selected successfully!', 'success');
    };

    reader.readAsDataURL(file);
  };

  // Save Product with Automatic Background Dual Translation
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodForm.name.trim()) return;

    setIsSaving(true);
    const finalImgUrl = prodForm.image_url || './images/p1.png';

    // Smart Background Auto Translation
    const rawName = prodForm.name.trim();
    const rawDesc = prodForm.description.trim();

    // Detect if entered title contains Arabic letters
    const isArabicName = /[\u0600-\u06FF]/.test(rawName);

    let nameEn = rawName;
    let nameAr = rawName;
    let descEn = rawDesc;
    let descAr = rawDesc;

    try {
      if (isArabicName) {
        nameAr = rawName;
        nameEn = await autoTranslateText(rawName, 'en');
        if (rawDesc) {
          descAr = rawDesc;
          descEn = await autoTranslateText(rawDesc, 'en');
        }
      } else {
        nameEn = rawName;
        nameAr = await autoTranslateText(rawName, 'ar');
        if (rawDesc) {
          descEn = rawDesc;
          descAr = await autoTranslateText(rawDesc, 'ar');
        }
      }
    } catch (err) {
      console.warn('Background translation note:', err);
    }

    const bilingualName = { en: nameEn, ar: nameAr };
    const bilingualDesc = { en: descEn, ar: descAr };

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: bilingualName,
        category_id: prodForm.category_id,
        price: prodForm.price ? parseFloat(prodForm.price) : null,
        price_type: prodForm.price_type,
        description: bilingualDesc,
        is_available: prodForm.is_available,
        is_featured: prodForm.is_featured
      }, finalImgUrl);
    } else {
      await addProduct({
        name: bilingualName,
        category_id: prodForm.category_id,
        price: prodForm.price ? parseFloat(prodForm.price) : null,
        price_type: prodForm.price_type,
        description: bilingualDesc,
        is_available: prodForm.is_available,
        is_featured: prodForm.is_featured
      }, finalImgUrl);
    }

    setIsSaving(false);
    setIsProductModalOpen(false);
  };

  // Category Submit
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleUpdateCategorySubmit = (e, catId) => {
    e.preventDefault();
    if (!editingCatName.trim()) return;
    updateCategory(catId, editingCatName.trim());
    setEditingCatId(null);
  };

  // Filtered Products for Admin Table
  const filteredAdminProducts = products.filter(p => {
    const q = adminSearch.toLowerCase().trim();
    if (!q) return true;
    const nameStr = tr(p.name).toLowerCase();
    const descStr = tr(p.description || '').toLowerCase();
    return nameStr.includes(q) || descStr.includes(q);
  });

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Admin Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{t('admin.manageProducts')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Workshop CMS & Full CRUD Portal</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('catalog')}
            >
              {t('custom.backToCatalog')}
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={logoutAdmin}
              style={{ background: 'var(--danger)', color: '#ffffff' }}
            >
              <LogOut width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.signOut')}
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('admin.totalProducts')}</span>
            <h3 style={{ fontSize: '28px', margin: '4px 0 0' }}>{products.length}</h3>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('admin.outOfStock')}</span>
            <h3 style={{ fontSize: '28px', margin: '4px 0 0', color: outOfStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {outOfStockCount}
            </h3>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('admin.orderRequests')}</span>
            <h3 style={{ fontSize: '28px', margin: '4px 0 0' }}>{orders.length}</h3>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('admin.customRequests')}</span>
            <h3 style={{ fontSize: '28px', margin: '4px 0 0' }}>{customRequests.length}</h3>
          </div>
        </div>

        {/* Action Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('products')}
            >
              <Package width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.manageProducts')} ({products.length})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('categories')}
            >
              <FolderTree width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.manageCategories')} ({categories.length})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.orderRequests')} ({orders.length})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('requests')}
            >
              <MessageSquareQuote width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.customRequests')} ({customRequests.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddProduct}
            >
              <Plus width="14" height="14" style={{ display: 'inline', margin: '0 4px' }} />
              {t('admin.addProduct')}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {/* TAB 1: PRODUCTS CRUD TABLE */}
          {activeTab === 'products' && (
            <div>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                  <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-text"
                    placeholder={t('admin.searchCatalog')}
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'inherit' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <th style={{ padding: '12px', textAlign: 'inherit' }}>Image</th>
                      <th style={{ padding: '12px', textAlign: 'inherit' }}>Product Name</th>
                      <th style={{ padding: '12px', textAlign: 'inherit' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'inherit' }}>Price (EGP)</th>
                      <th style={{ padding: '12px', textAlign: 'inherit' }}>Availability</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminProducts.map(p => {
                      const catObj = categories.find(c => c.id === p.category_id);
                      const imgObj = productImages.find(i => i.product_id === p.id);
                      const displayImg = imgObj?.url || './images/p1.png';

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px' }}>
                            <img src={displayImg} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            {tr(p.name)}
                            {p.is_featured && <span className="badge badge-warning" style={{ fontSize: '10px', marginLeft: '6px' }}>Featured</span>}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{tr(catObj ? catObj.name : '-')}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            {p.price_type === 'on_request' ? t('common.onRequest') : `${(p.price || 0).toLocaleString()} L.E.`}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {p.is_available ? (
                              <span className="badge badge-success">{t('common.available')}</span>
                            ) : (
                              <span className="badge badge-danger">{t('common.unavailable')}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${tr(p.name)}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES CRUD TABLE */}
          {activeTab === 'categories' && (
            <div>
              <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '480px' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder={t('admin.categoryPlaceholder')}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={16} /> {t('admin.createCategory')}
                </button>
              </form>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {categories.map(cat => (
                  <li key={cat.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editingCatId === cat.id ? (
                      <form onSubmit={(e) => handleUpdateCategorySubmit(e, cat.id)} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <input
                          type="text"
                          className="input-text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-primary btn-sm"><Check size={14} /></button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingCatId(null)}><X size={14} /></button>
                      </form>
                    ) : (
                      <>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--primary-900)' }}>{tr(cat.name)}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>ID: {cat.id}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Delete category "${tr(cat.name)}"?`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No web order requests submitted yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {orders.map(ord => (
                  <li key={ord.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '4px' }}>
                        👤 {ord.customer_name} — <a href={`tel:${ord.phone}`} style={{ color: 'var(--accent-700)' }}>{ord.phone}</a>
                      </div>
                      {ord.notes && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>📝 Notes: {ord.notes}</p>}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <select
                        className="input-select"
                        value={ord.status || 'pending'}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Delete order request?')) deleteOrder(ord.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}

          {/* TAB 4: CUSTOM REQUESTS MANAGEMENT */}
          {activeTab === 'requests' && (
            customRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No custom photo requests submitted yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {customRequests.map(req => (
                  <li key={req.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '4px' }}>
                        👤 {req.customer_name} — <a href={`tel:${req.phone}`} style={{ color: 'var(--accent-700)' }}>{req.phone}</a>
                      </div>
                      <p style={{ fontSize: '14px', margin: '4px 0' }}>📝 {req.description}</p>
                      {req.dimensions_note && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0' }}>📏 Dimensions: {req.dimensions_note}</p>}
                      {req.materials_note && <p style={{ fontSize: '13px', color: 'var(--accent-700)', margin: '2px 0' }}>🪵 Materials: {req.materials_note}</p>}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <select
                        className="input-select"
                        value={req.status || 'new'}
                        onChange={(e) => updateCustomRequestStatus(req.id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="new">New</option>
                        <option value="in_review">In Review</option>
                        <option value="quoted">Quoted</option>
                        <option value="closed">Closed</option>
                      </select>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Delete custom request?')) deleteCustomRequest(req.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL (CLEAN & SIMPLE) */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#ffffff',
            maxWidth: '560px',
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            padding: '30px',
            boxShadow: 'var(--shadow-lg)',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Title *</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Dining Table or طاولة طعام"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="input-select"
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{tr(c.name)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price Type</label>
                  <select
                    className="input-select"
                    value={prodForm.price_type}
                    onChange={(e) => setProdForm({ ...prodForm, price_type: e.target.value })}
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="range">Price Range (From)</option>
                    <option value="on_request">Price on Request</option>
                  </select>
                </div>
              </div>

              {prodForm.price_type !== 'on_request' && (
                <div className="form-group">
                  <label className="form-label">Base Price (EGP)</label>
                  <input
                    type="number"
                    className="input-text"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  />
                </div>
              )}

              {/* IMAGE FILE UPLOAD ZONE */}
              <div className="form-group">
                <label className="form-label">Product Photo *</label>
                
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--bg-main)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />

                  {prodForm.image_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      <img
                        src={prodForm.image_url}
                        alt="Preview"
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--primary-900)' }}>
                          Photo Selected
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Click or drag to replace photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={28} style={{ color: 'var(--accent-600)', marginBottom: '8px' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', color: 'var(--primary-900)' }}>
                        {isUploading ? 'Processing Image...' : 'Click or Drag & Drop to Upload Product Image'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Supports PNG, JPG, WebP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input-text"
                  rows="3"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={prodForm.is_available}
                    onChange={(e) => setProdForm({ ...prodForm, is_available: e.target.checked })}
                  />
                  Available in Workshop
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={prodForm.is_featured}
                    onChange={(e) => setProdForm({ ...prodForm, is_featured: e.target.checked })}
                  />
                  Featured Item
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isUploading || isSaving}>
                  {isSaving ? 'Saving...' : (editingProductId ? 'Save Product Changes' : 'Create Product')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
