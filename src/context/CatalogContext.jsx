import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { generateSeedData } from '../data/mockData';
import { getSupabaseClient, getSupabaseCredentials } from '../lib/supabaseClient';

const CatalogContext = createContext();
const DB_KEY = 'LOCAL_DB_V8';
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

  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Save local dbData changes
  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(dbData));
    } catch (e) {
      console.error('Failed to save dbData:', e);
    }
  }, [dbData]);

  // Hidden Admin Access Listener (#admin route and Ctrl+Shift+A shortcut)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin') || hash.includes('portal')) {
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        setCurrentView(isAuth ? 'admin-dashboard' : 'admin-login');
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        setCurrentView(prev => (prev === 'admin-dashboard' || prev === 'admin-login') ? 'catalog' : (isAuth ? 'admin-dashboard' : 'admin-login'));
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load from Supabase if configured
  const loadFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setIsSupabaseConnected(false);
      return false;
    }

    setIsSyncing(true);
    try {
      const [catRes, prodRes, imgRes, ogRes, ovRes, ordRes, reqRes] = await Promise.all([
        client.from('categories').select('*'),
        client.from('products').select('*'),
        client.from('product_images').select('*'),
        client.from('option_groups').select('*'),
        client.from('option_values').select('*'),
        client.from('orders').select('*').order('created_at', { ascending: false }),
        client.from('custom_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (catRes.error || prodRes.error) {
        console.warn('Supabase query returned error:', catRes.error || prodRes.error);
        setIsSupabaseConnected(false);
        setIsSyncing(false);
        return false;
      }

      setIsSupabaseConnected(true);

      if (prodRes.data && prodRes.data.length > 0) {
        setDbData(prev => ({
          ...prev,
          categories: catRes.data || [],
          products: prodRes.data || [],
          product_images: imgRes.data || [],
          option_groups: ogRes.data || [],
          option_values: ovRes.data || [],
          orders: ordRes.data || [],
          custom_requests: reqRes.data || []
        }));
      }

      setIsSyncing(false);
      return true;
    } catch (e) {
      console.error('Supabase fetch exception:', e);
      setIsSupabaseConnected(false);
      setIsSyncing(false);
      return false;
    }
  };

  useEffect(() => {
    loadFromSupabase();
  }, []);

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

  // Seed Supabase Remote Tables with Seed Data
  const seedSupabaseDatabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      showToast('Please configure your Supabase URL & Anon Key first!', 'error');
      return false;
    }

    setIsSyncing(true);
    try {
      const seed = generateSeedData();

      await client.from('categories').upsert(seed.categories, { onConflict: 'id' });
      await client.from('products').upsert(seed.products, { onConflict: 'id' });
      await client.from('product_images').upsert(seed.product_images, { onConflict: 'id' });
      await client.from('option_groups').upsert(seed.option_groups, { onConflict: 'id' });
      await client.from('option_values').upsert(seed.option_values, { onConflict: 'id' });

      showToast('Successfully seeded Supabase database!', 'success');
      await loadFromSupabase();
      return true;
    } catch (e) {
      console.error('Failed to seed Supabase database:', e);
      showToast('Error seeding Supabase: ' + e.message, 'error');
      setIsSyncing(false);
      return false;
    }
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

  // =========================================================================
  // ADMIN CRUD OPERATIONS (Products, Categories, Orders, Custom Requests)
  // =========================================================================

  // 1. CREATE PRODUCT
  const addProduct = async (productData, imageUrl) => {
    const newProdId = 'prod-' + Date.now();
    const newImgId = 'img-' + Date.now();

    const newProduct = {
      id: newProdId,
      name: productData.name,
      category_id: productData.category_id,
      price: productData.price ? parseFloat(productData.price) : null,
      price_type: productData.price_type || 'fixed',
      description: productData.description || '',
      is_available: productData.is_available ?? true,
      is_featured: productData.is_featured ?? false,
      created_at: new Date().toISOString()
    };

    const newImg = {
      id: newImgId,
      product_id: newProdId,
      url: imageUrl || './images/p1.png',
      sort_order: 0,
      created_at: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      products: [newProduct, ...(prev.products || [])],
      product_images: [newImg, ...(prev.product_images || [])]
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').insert([newProduct]);
        await client.from('product_images').insert([newImg]);
      } catch (e) {
        console.error('Supabase addProduct error:', e);
      }
    }

    showToast(`Created product "${newProduct.name}"`, 'success');
    return newProduct;
  };

  // 2. UPDATE PRODUCT
  const updateProduct = async (productId, updatedFields, newImageUrl) => {
    setDbData(prev => {
      const updatedProducts = (prev.products || []).map(p =>
        p.id === productId ? { ...p, ...updatedFields } : p
      );
      
      let updatedImages = prev.product_images || [];
      if (newImageUrl) {
        const existingImgIndex = updatedImages.findIndex(i => i.product_id === productId);
        if (existingImgIndex >= 0) {
          updatedImages = updatedImages.map(i => i.product_id === productId ? { ...i, url: newImageUrl } : i);
        } else {
          updatedImages = [{ id: 'img-' + Date.now(), product_id: productId, url: newImageUrl, sort_order: 0 }, ...updatedImages];
        }
      }

      return {
        ...prev,
        products: updatedProducts,
        product_images: updatedImages
      };
    });

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').update(updatedFields).eq('id', productId);
        if (newImageUrl) {
          await client.from('product_images').upsert({ id: 'img-' + productId, product_id: productId, url: newImageUrl, sort_order: 0 });
        }
      } catch (e) {
        console.error('Supabase updateProduct error:', e);
      }
    }

    showToast('Updated product specifications', 'success');
  };

  // 3. DELETE PRODUCT
  const deleteProduct = async (productId) => {
    setDbData(prev => ({
      ...prev,
      products: (prev.products || []).filter(p => p.id !== productId),
      product_images: (prev.product_images || []).filter(i => i.product_id !== productId),
      option_groups: (prev.option_groups || []).filter(og => og.product_id !== productId)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').delete().eq('id', productId);
      } catch (e) {
        console.error('Supabase deleteProduct error:', e);
      }
    }

    showToast('Product deleted from catalog', 'info');
  };

  // 4. CREATE CATEGORY
  const addCategory = async (name) => {
    const newCat = {
      id: 'cat-' + Date.now(),
      name,
      created_at: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('categories').insert([newCat]);
      } catch (e) {
        console.error('Supabase addCategory error:', e);
      }
    }

    showToast(`Created category "${name}"`, 'success');
    return newCat;
  };

  // 5. UPDATE CATEGORY
  const updateCategory = async (categoryId, name) => {
    setDbData(prev => ({
      ...prev,
      categories: (prev.categories || []).map(c => c.id === categoryId ? { ...c, name } : c)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('categories').update({ name }).eq('id', categoryId);
      } catch (e) {
        console.error('Supabase updateCategory error:', e);
      }
    }

    showToast('Updated category name', 'success');
  };

  // 6. DELETE CATEGORY
  const deleteCategory = async (categoryId) => {
    setDbData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(c => c.id !== categoryId)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('categories').delete().eq('id', categoryId);
      } catch (e) {
        console.error('Supabase deleteCategory error:', e);
      }
    }

    showToast('Deleted category', 'info');
  };

  // 7. UPDATE ORDER STATUS & DELETE ORDER
  const updateOrderStatus = async (orderId, status) => {
    setDbData(prev => ({
      ...prev,
      orders: (prev.orders || []).map(o => o.id === orderId ? { ...o, status } : o)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').update({ status }).eq('id', orderId);
      } catch (e) {
        console.error('Supabase updateOrderStatus error:', e);
      }
    }

    showToast(`Updated order status to ${status}`, 'success');
  };

  const deleteOrder = async (orderId) => {
    setDbData(prev => ({
      ...prev,
      orders: (prev.orders || []).filter(o => o.id !== orderId)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.error('Supabase deleteOrder error:', e);
      }
    }

    showToast('Order removed', 'info');
  };

  // 8. UPDATE CUSTOM REQUEST STATUS & DELETE
  const updateCustomRequestStatus = async (reqId, status) => {
    setDbData(prev => ({
      ...prev,
      custom_requests: (prev.custom_requests || []).map(r => r.id === reqId ? { ...r, status } : r)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('custom_requests').update({ status }).eq('id', reqId);
      } catch (e) {
        console.error('Supabase updateCustomRequestStatus error:', e);
      }
    }

    showToast(`Updated request status to ${status}`, 'success');
  };

  const deleteCustomRequest = async (reqId) => {
    setDbData(prev => ({
      ...prev,
      custom_requests: (prev.custom_requests || []).filter(r => r.id !== reqId)
    }));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('custom_requests').delete().eq('id', reqId);
      } catch (e) {
        console.error('Supabase deleteCustomRequest error:', e);
      }
    }

    showToast('Custom request removed', 'info');
  };

  // Submit Web Order Request (Customer Facing)
  const submitOrder = async (orderInfo) => {
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').insert([newOrder]);
        await client.from('order_items').insert([newOrderItem]);
      } catch (e) {
        console.error('Supabase order insert error:', e);
      }
    }
  };

  // Submit Custom Photo Request (Customer Facing)
  const submitCustomRequest = async (reqInfo) => {
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('custom_requests').insert([newReq]);
      } catch (e) {
        console.error('Supabase custom request insert error:', e);
      }
    }
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
      seedSupabaseDatabase,
      loadFromSupabase,
      isSupabaseConnected,
      isSyncing,
      getSupabaseCredentials,
      submitOrder,
      submitCustomRequest,
      // CRUD Operations
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
