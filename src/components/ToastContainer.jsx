import React from 'react';
import { useCatalog } from '../context/CatalogContext';

export function ToastContainer() {
  const { toasts } = useCatalog();

  if (toasts.length === 0) return null;

  return (
    <div class="toast-container" id="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} class={`toast toast-${toast.type || 'info'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
