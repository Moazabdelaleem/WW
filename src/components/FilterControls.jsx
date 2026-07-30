import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';
import { Search } from 'lucide-react';

export function FilterControls() {
  const { t, tr } = useI18n();
  const {
    activeDepartment,
    setActiveDepartment,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    priceTypeFilter,
    setPriceTypeFilter,
    availableOnly,
    setAvailableOnly,
    categories,
    products,
    filteredProducts,
    isCategoryInDepartment
  } = useCatalog();

  const visibleCategories = categories.filter(cat => isCategoryInDepartment(cat.name, activeDepartment));

  const totalDeptCount = products.filter(p => {
    const catObj = categories.find(c => c.id === p.category_id);
    return isCategoryInDepartment(catObj ? catObj.name : '', activeDepartment);
  }).length;

  return (
    <>
      <div class="filter-controls-container">
        {/* Department Switcher */}
        <div class="department-bar">
          <div class="department-header">
            <span class="filter-step-label">{t('filter.deptLabel')}</span>
            <select
              class="select-input select-department"
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
            >
              <option value="all">{t('filter.deptAll')}</option>
              <option value="home">{t('filter.deptHome')}</option>
              <option value="carpentry">{t('filter.deptCarpentry')}</option>
              <option value="office">{t('filter.deptOffice')}</option>
            </select>
          </div>
        </div>

        {/* Subcategory Filter Pills */}
        <div class="subcategory-bar-wrapper">
          <span class="filter-step-label">{t('filter.subcatLabel')}</span>
          <div class="category-bar">
            <button
              class={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              {t('filter.allFurniture')} <span class="pill-count">{totalDeptCount}</span>
            </button>

            {visibleCategories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  class={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {tr(cat.name)} <span class="pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Catalog Search & Filters Toolbar */}
      <div class="catalog-toolbar">
        <div class="search-wrapper toolbar-search">
          <Search class="search-icon" width="18" height="18" />
          <input
            type="text"
            class="input-text"
            placeholder={t('filter.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div class="toolbar-filters">
          <select
            class="select-input select-sm"
            value={priceTypeFilter}
            onChange={(e) => setPriceTypeFilter(e.target.value)}
          >
            <option value="all">{t('filter.anyPrice')}</option>
            <option value="fixed">{t('filter.fixed')}</option>
            <option value="range">{t('filter.range')}</option>
            <option value="on_request">{t('filter.onRequest')}</option>
          </select>

          <label class="toggle-wrapper">
            <input
              type="checkbox"
              class="toggle-input"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">{t('filter.availableOnly')}</span>
          </label>

          <span class="products-count">
            {t('products.showingCount', { n: filteredProducts.length })}
          </span>
        </div>
      </div>
    </>
  );
}
