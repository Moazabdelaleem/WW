import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { Package, FolderTree, ShoppingBag, MessageSquareQuote, LogOut } from 'lucide-react';

export function AdminDashboardPage() {
  const { t, tr } = useI18n();
  const {
    products,
    categories,
    orders,
    customRequests,
    logoutAdmin,
    setCurrentView
  } = useCatalog();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'orders' | 'requests'

  const outOfStockCount = products.filter(p => !p.is_available).length;

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Admin Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{t('admin.manageProducts')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Workshop CMS & Order Request Portal</p>
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
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

        {/* Tab Content */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          {activeTab === 'products' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'inherit' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px', textAlign: 'inherit' }}>Product Name</th>
                    <th style={{ padding: '12px', textAlign: 'inherit' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'inherit' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'inherit' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const catObj = categories.find(c => c.id === p.category_id);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{tr(p.name)}</td>
                        <td style={{ padding: '12px' }}>{tr(catObj ? catObj.name : '-')}</td>
                        <td style={{ padding: '12px' }}>
                          {p.price_type === 'on_request' ? t('common.onRequest') : `$${p.price}`}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {p.is_available ? (
                            <span className="badge badge-success">{t('common.available')}</span>
                          ) : (
                            <span className="badge badge-danger">{t('common.unavailable')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <ul style={{ listStyle: 'none' }}>
              {categories.map(cat => (
                <li key={cat.id} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '15px' }}>{tr(cat.name)}</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {cat.id}</span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'orders' && (
            orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No web order requests submitted yet.</p>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {orders.map(ord => (
                  <li key={ord.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>👤 {ord.customer_name} ({ord.phone})</strong>
                      <span className="badge badge-success">{ord.status}</span>
                    </div>
                    {ord.notes && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📝 Notes: {ord.notes}</p>}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )
          )}

          {activeTab === 'requests' && (
            customRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No custom photo requests submitted yet.</p>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {customRequests.map(req => (
                  <li key={req.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>👤 {req.customer_name} ({req.phone})</strong>
                      <span className="badge badge-info">{req.status}</span>
                    </div>
                    <p style={{ fontSize: '14px', margin: '4px 0' }}>📝 {req.description}</p>
                    {req.materials_note && <p style={{ fontSize: '13px', color: 'var(--accent-700)' }}>🪵 Materials: {req.materials_note}</p>}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
