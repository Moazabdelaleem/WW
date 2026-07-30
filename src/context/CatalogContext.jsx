import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { generateSeedData } from '../data/mockData';

const CatalogContext = createContext();
const DB_KEY = 'LOCAL_DB_V4';
const AUTH_KEY = 'LOCAL_ADMIN_AUTH';

export function CatalogProvider({ children }) {
  const [dbData, setDbData] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local DB state:', e);
    }
    const seeded = generateSeedData();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  // Navigation View
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'custom-request' | 'admin-login' | 'admin-dashboard'

  // Filters
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceTypeFilter, setPriceTypeFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Selected product drawer modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Floating Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Save dbData changes
  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(dbData));
    } catch (e) {
      console.error('Failed to save dbData:', e);
    }
  }, [dbData]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const seedDemoData = () => {
    const fresh = generateSeedData();
    setDbData(fresh);
    showToast('Loaded demo products!', 'success');
  };

  const resetFilters = () => {
    setActiveDepartment('all');
    setActiveCategory('all');
    setSearchQuery('');
    setPriceTypeFilter('all');
    setAvailableOnly(false);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  // Category Department Helper
  const DEPT_MAP = {
    home: ['Living Room', 'Dining Room', 'Bedroom', 'Outdoor'],
    carpentry: ['Bespoke Doors', 'Wall Paneling', 'Custom Wardrobes'],
    office: ['Desks & Workstations', 'Seating', 'Conference']
  };

  const isCategoryInDepartment = (catName, dept) => {
    if (dept === 'all') return true;
    const allowed = DEPT_MAP[dept] || [];
    return allowed.includes(catName);
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    const { products, categories } = dbData;
    return (products || []).filter(product => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = product.name.toLowerCase().includes(q);
      const descMatch = (product.description || '').toLowerCase().includes(q);
      if (q && !nameMatch && !descMatch) return false;

      const catObj = (categories || []).find(c => c.id === product.category_id);
      const catName = catObj ? catObj.name : '';
      if (!isCategoryInDepartment(catName, activeDepartment)) return false;

      if (activeCategory !== 'all' && product.category_id !== activeCategory) return false;
      if (priceTypeFilter !== 'all' && product.price_type !== priceTypeFilter) return false;
      if (availableOnly && !product.is_available) return false;

      return true;
    });
  }, [dbData, activeDepartment, activeCategory, searchQuery, priceTypeFilter, availableOnly]);

  // Submit Web Order Request
  const submitOrder = (orderInfo) => {
    const { customerName, phone, notes, productId, quantity, selectedOptions, totalPrice } = orderInfo;
    const orderId = 'ord-' + Date.now();
    
    const newOrder = {
      id: orderId,
      customer_name: customerName,
      phone,
      notes,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const newOrderItem = {
      id: 'item-' + Date.now(),
      order_id: orderId,
      product_id: productId,
      quantity,
      selected_options: selectedOptions,
      total_price: totalPrice,
      created_at: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      orders: [newOrder, ...(prev.orders || [])],
      order_items: [newOrderItem, ...(prev.order_items || [])]
    }));
  };

  // Submit Custom Photo Request
  const submitCustomRequest = (reqInfo) => {
    const newReq = {
      id: 'req-' + Date.now(),
      ...reqInfo,
      status: 'new',
      created_at: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      custom_requests: [newReq, ...(prev.custom_requests || [])]
    }));
  };

  // Admin Auth
  const loginAdmin = (email, password) => {
    if (email === 'admin@local.test' && password === 'admin123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(AUTH_KEY, 'true');
      setCurrentView('admin-dashboard');
      showToast('Signed in to Admin Panel', 'success');
      return true;
    }
    showToast('Invalid email or password', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(AUTH_KEY);
    setCurrentView('catalog');
    showToast('Signed out of Admin Panel', 'info');
  };

  return (
    <CatalogContext.Provider value={{
      dbData,
      products: dbData.products || [],
      categories: dbData.categories || [],
      productImages: dbData.product_images || [],
      optionGroups: dbData.option_groups || [],
      optionValues: dbData.option_values || [],
      orders: dbData.orders || [],
      customRequests: dbData.custom_requests || [],
      filteredProducts,
      activeDepartment,
      setActiveDepartment: (dept) => {
        setActiveDepartment(dept);
        setActiveCategory('all');
      },
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      priceTypeFilter,
      setPriceTypeFilter,
      availableOnly,
      setAvailableOnly,
      resetFilters,
      selectedProduct,
      openProductModal,
      closeProductModal,
      currentView,
      setCurrentView,
      toasts,
      showToast,
      seedDemoData,
      submitOrder,
      submitCustomRequest,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      isCategoryInDepartment
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
