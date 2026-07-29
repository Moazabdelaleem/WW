import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './context/I18nContext';
import { CatalogProvider } from './context/CatalogContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <CatalogProvider>
        <AppContent />
      </CatalogProvider>
    </I18nProvider>
  </React.StrictMode>
);
