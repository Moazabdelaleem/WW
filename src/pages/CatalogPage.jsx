import React from 'react';
import { Hero } from '../components/Hero';
import { EarlyTrustBar } from '../components/EarlyTrustBar';
import { CatalogBreadcrumb } from '../components/CatalogBreadcrumb';
import { FilterControls } from '../components/FilterControls';
import { ProductsGrid } from '../components/ProductsGrid';

export function CatalogPage() {
  return (
    <>
      <Hero />
      <EarlyTrustBar />
      <section className="catalog-section" id="catalog-section">
        <div className="container">
          <CatalogBreadcrumb />
          <FilterControls />
          <ProductsGrid />
        </div>
      </section>
    </>
  );
}
