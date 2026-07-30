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
      <section class="catalog-section" id="catalog-section">
        <div class="container">
          <CatalogBreadcrumb />
          <FilterControls />
          <ProductsGrid />
        </div>
      </section>
    </>
  );
}
