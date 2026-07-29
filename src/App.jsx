import React, { useEffect } from 'react';
import { useCatalog } from './context/CatalogContext';
import { Header } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { CustomRequestPage } from './pages/CustomRequestPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProductDrawerModal } from './components/ProductDrawerModal';
import { FloatingWhatsappBtn } from './components/FloatingWhatsappBtn';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

export function AppContent() {
  const { currentView, setCurrentView, isAdminLoggedIn } = useCatalog();

  // Secret Admin Shortcut: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminLoggedIn) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('admin-login');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminLoggedIn, setCurrentView]);

  return (
    <div class="app-wrapper">
      <Header />

      <main class="main-content">
        {currentView === 'catalog' && <CatalogPage />}
        {currentView === 'custom-request' && <CustomRequestPage />}
        {currentView === 'admin-login' && <AdminLoginPage />}
        {currentView === 'admin-dashboard' && <AdminDashboardPage />}
      </main>

      <ProductDrawerModal />
      <FloatingWhatsappBtn />
      <ToastContainer />
      <Footer />
    </div>
  );
}
