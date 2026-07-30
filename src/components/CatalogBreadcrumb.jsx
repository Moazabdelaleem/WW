import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useCatalog } from '../context/CatalogContext';

export function CatalogBreadcrumb() {
  const { t, tr } = useI18n();
  const { activeDepartment, activeCategory, categories, setCurrentView } = useCatalog();

  const deptNames = {
    all: t('filter.deptAll'),
    home: t('filter.deptHome'),
    carpentry: t('filter.deptCarpentry'),
    office: t('filter.deptOffice')
  };

  const activeCatObj = categories.find(c => c.id === activeCategory);

  return (
    <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
      <span className="breadcrumb-item">
        <a 
          href="#catalog" 
          onClick={(e) => { e.preventDefault(); setCurrentView('catalog'); }}
        >
          {t('nav.catalog')}
        </a>
      </span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-item active">
        {deptNames[activeDepartment] || t('filter.deptAll')}
      </span>
      {activeCategory !== 'all' && activeCatObj && (
        <>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">
            {tr(activeCatObj.name)}
          </span>
        </>
      )}
    </nav>
  );
}
