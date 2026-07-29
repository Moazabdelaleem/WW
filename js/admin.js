// admin.js
// Handles administrative dashboard logic, product CRUD, category CRUD, and image storage.

import { getSupabaseClient, isSupabaseConfigured, isUsingLocalMode, clearSupabaseConfig } from './supabaseClient.js';

// --- State Variables ---
let sessionUser = null;
let products = [];
let categories = [];
let productImagesState = []; // mixed array: { id, url, isExisting: true } or { file, previewUrl, isExisting: false }
let imagesToDeleteFromDB = []; // IDs of existing product_images to delete on save
let orders = [];
let customRequests = [];
let currentOptionGroups = []; // option groups (with nested values) for the product currently being edited
let currentOrderDetail = null; // the order object currently open in the order detail modal
let currentCustomRequestDetail = null; // the custom request currently open in its detail modal

// --- DOM Elements ---
// Nav & Auth
const adminUserEmail = document.getElementById('admin-user-email');
const disconnectDbBtn = document.getElementById('disconnect-db-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

// Stats
const statTotalProducts = document.getElementById('stat-total-products');
const statOutOfStock = document.getElementById('stat-out-of-stock');
const statTotalCategories = document.getElementById('stat-total-categories');

// Tabs & Navigation Panels
const tabProducts = document.getElementById('tab-products');
const tabCategories = document.getElementById('tab-categories');
const panelProducts = document.getElementById('panel-products');
const panelCategories = document.getElementById('panel-categories');

// Products List Elements
const adminProductSearch = document.getElementById('admin-product-search');
const addProductBtn = document.getElementById('add-product-btn');
const adminProductsLoader = document.getElementById('admin-products-loader');
const adminProductsList = document.getElementById('admin-products-list');

// Product Form Modal Elements
const productFormModal = document.getElementById('product-form-modal');
const closeProductModalBtn = document.getElementById('close-product-modal');
const productModalTitle = document.getElementById('product-modal-title');
const productForm = document.getElementById('admin-product-form');
const productEditId = document.getElementById('product-edit-id');
const productName = document.getElementById('product-name');
const productCategory = document.getElementById('product-category');
const productPriceType = document.getElementById('product-price-type');
const productPrice = document.getElementById('product-price');
const priceInputGroup = document.getElementById('price-input-group');
const productDescription = document.getElementById('product-description');
const productAvailable = document.getElementById('product-available');
const uploadZone = document.getElementById('upload-zone');
const productFileInput = document.getElementById('product-file-input');
const previewsContainer = document.getElementById('previews-container');
const productFormCancel = document.getElementById('product-form-cancel');
const productFormSubmit = document.getElementById('product-form-submit');

// Categories Panel Elements
const categoryForm = document.getElementById('admin-category-form');
const categoryFormTitle = document.getElementById('category-form-title');
const categoryEditId = document.getElementById('category-edit-id');
const categoryNameInput = document.getElementById('category-name');
const categorySubmitBtn = document.getElementById('category-submit-btn');
const categoryCancelBtn = document.getElementById('category-cancel-btn');
const adminCategoriesLoader = document.getElementById('admin-categories-loader');
const adminCategoriesList = document.getElementById('admin-categories-list');

// Orders Tab Elements
const tabOrders = document.getElementById('tab-orders');
const panelOrders = document.getElementById('panel-orders');
const ordersPendingBadge = document.getElementById('orders-pending-badge');
const ordersStatusFilter = document.getElementById('orders-status-filter');
const adminOrdersLoader = document.getElementById('admin-orders-loader');
const adminOrdersList = document.getElementById('admin-orders-list');

// Custom Requests Tab Elements
const tabCustomRequests = document.getElementById('tab-custom-requests');
const panelCustomRequests = document.getElementById('panel-custom-requests');
const customRequestsPendingBadge = document.getElementById('custom-requests-pending-badge');
const customRequestsStatusFilter = document.getElementById('custom-requests-status-filter');
const adminCustomRequestsLoader = document.getElementById('admin-custom-requests-loader');
const adminCustomRequestsList = document.getElementById('admin-custom-requests-list');

// Custom Request Detail Modal Elements
const customRequestDetailModal = document.getElementById('custom-request-detail-modal');
const closeCustomRequestModalBtn = document.getElementById('close-custom-request-modal');
const customRequestDetailCustomer = document.getElementById('custom-request-detail-customer');
const customRequestDetailPhone = document.getElementById('custom-request-detail-phone');
const customRequestDetailCategory = document.getElementById('custom-request-detail-category');
const customRequestDetailDescription = document.getElementById('custom-request-detail-description');
const customRequestDetailDimensionsWrap = document.getElementById('custom-request-detail-dimensions-wrap');
const customRequestDetailDimensions = document.getElementById('custom-request-detail-dimensions');
const customRequestDetailMaterialsWrap = document.getElementById('custom-request-detail-materials-wrap');
const customRequestDetailMaterials = document.getElementById('custom-request-detail-materials');
const customRequestDetailReferenceWrap = document.getElementById('custom-request-detail-reference-wrap');
const customRequestDetailReference = document.getElementById('custom-request-detail-reference');
const customRequestDetailNotes = document.getElementById('custom-request-detail-notes');
const customRequestDetailStatus = document.getElementById('custom-request-detail-status');
const customRequestSaveBtn = document.getElementById('custom-request-save-btn');

// Order Detail Modal Elements
const orderDetailModal = document.getElementById('order-detail-modal');
const closeOrderModalBtn = document.getElementById('close-order-modal');
const orderDetailCustomer = document.getElementById('order-detail-customer');
const orderDetailPhone = document.getElementById('order-detail-phone');
const orderDetailItems = document.getElementById('order-detail-items');
const orderDetailNotes = document.getElementById('order-detail-notes');
const orderMarkPending = document.getElementById('order-mark-pending');
const orderMarkConfirmed = document.getElementById('order-mark-confirmed');
const orderMarkRejected = document.getElementById('order-mark-rejected');

// Product Options Elements
const optionsSection = document.getElementById('options-section');
const optionGroupsList = document.getElementById('option-groups-list');
const newOptionGroupName = document.getElementById('new-option-group-name');
const newOptionGroupType = document.getElementById('new-option-group-type');
const addOptionGroupBtn = document.getElementById('add-option-group-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Guard Authentication & Config
  if (!isSupabaseConfigured()) {
    redirectToLogin();
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) {
    redirectToLogin();
    return;
  }

  sessionUser = data.session.user;
  adminUserEmail.textContent = sessionUser.email;

  if (isUsingLocalMode()) {
    const badge = document.getElementById('local-mode-badge');
    if (badge) badge.style.display = 'inline-block';
    if (disconnectDbBtn) disconnectDbBtn.style.display = 'none';
  }

  // 2. Setup Page Logic
  setupGlobalEventListeners();
  loadDashboardData();
});

function redirectToLogin() {
  window.location.href = 'login.html';
}

// --- Global Event Listeners ---
function setupGlobalEventListeners() {
  // Logout & Disconnect
  adminLogoutBtn.addEventListener('click', handleLogout);
  disconnectDbBtn.addEventListener('click', () => {
    if (confirm("Disconnect database? This will clear your locally configured Supabase credentials.")) {
      clearSupabaseConfig();
    }
  });

  // Tab switching
  tabProducts.addEventListener('click', () => switchTab('products'));
  tabCategories.addEventListener('click', () => switchTab('categories'));
  tabOrders.addEventListener('click', () => switchTab('orders'));
  tabCustomRequests.addEventListener('click', () => switchTab('custom-requests'));

  // Orders
  ordersStatusFilter.addEventListener('change', renderOrdersList);
  closeOrderModalBtn.addEventListener('click', closeOrderModal);
  orderMarkPending.addEventListener('click', () => submitOrderStatusChange('pending'));
  orderMarkConfirmed.addEventListener('click', () => submitOrderStatusChange('confirmed'));
  orderMarkRejected.addEventListener('click', () => submitOrderStatusChange('rejected'));

  // Custom Requests
  customRequestsStatusFilter.addEventListener('change', renderCustomRequestsList);
  closeCustomRequestModalBtn.addEventListener('click', closeCustomRequestDetail);
  customRequestSaveBtn.addEventListener('click', submitCustomRequestUpdate);

  // Product customization options
  addOptionGroupBtn.addEventListener('click', handleAddOptionGroup);

  // Search products
  adminProductSearch.addEventListener('input', renderProductsList);

  // Add Product Button
  addProductBtn.addEventListener('click', () => openProductModal());

  // Cancel & Close Product Form
  closeProductModalBtn.addEventListener('click', closeProductModal);
  productFormCancel.addEventListener('click', closeProductModal);

  // Price Type change (show/hide price field)
  productPriceType.addEventListener('change', handlePriceTypeChange);

  // Drag & Drop / File Upload Previews
  productFileInput.addEventListener('change', handleFileSelection);
  setupDragAndDrop();

  // Save Product Form
  productForm.addEventListener('submit', handleProductSubmit);

  // Save Category Form
  categoryForm.addEventListener('submit', handleCategorySubmit);
  categoryCancelBtn.addEventListener('click', resetCategoryForm);
}

function handlePriceTypeChange() {
  if (productPriceType.value === 'on_request') {
    priceInputGroup.style.display = 'none';
    productPrice.removeAttribute('required');
    productPrice.value = '';
  } else {
    priceInputGroup.style.display = 'block';
    productPrice.setAttribute('required', 'required');
  }
}

// --- Switch Tabs ---
function switchTab(tab) {
  const tabs = { products: [tabProducts, panelProducts], categories: [tabCategories, panelCategories], orders: [tabOrders, panelOrders], 'custom-requests': [tabCustomRequests, panelCustomRequests] };
  Object.keys(tabs).forEach(key => {
    const [btn, panel] = tabs[key];
    if (key === tab) {
      btn.classList.add('active');
      panel.classList.add('active');
    } else {
      btn.classList.remove('active');
      panel.classList.remove('active');
    }
  });
  if (tab === 'orders') renderOrdersList();
  if (tab === 'custom-requests') renderCustomRequestsList();
}

// --- Fetch & Load Dashboard Data ---
async function loadDashboardData() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    showProductsLoader(true);
    showCategoriesLoader(true);

    // 1. Fetch categories
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (catError) throw catError;
    categories = catData || [];

    // 2. Fetch products and joins
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(id, url, sort_order)
      `)
      .order('created_at', { ascending: false });

    if (prodError) throw prodError;
    products = prodData || [];

    // Sort images client-side
    products.forEach(p => {
      if (p.product_images && p.product_images.length > 0) {
        p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    });

    // 3. Fetch orders and their line items (admin-only read, per RLS)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`*, order_items(id, product_id, quantity, selected_options, total_price)`)
      .order('created_at', { ascending: false });

    if (orderError) throw orderError;
    orders = orderData || [];

    // 4. Fetch custom ("Make Your Own") requests — admin-only read, per RLS
    const { data: customReqData, error: customReqError } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (customReqError) throw customReqError;
    customRequests = customReqData || [];

    // Populate category selectors
    populateCategoryDropdowns();

    // Render panels
    renderProductsList();
    renderCategoriesList();
    updateStats();
    updateOrdersBadge();
    updateCustomRequestsBadge();

  } catch (error) {
    console.error("Dashboard load error:", error.message);
    alert("Error loading dashboard data: " + error.message);
  } finally {
    showProductsLoader(false);
    showCategoriesLoader(false);
  }
}

// --- Populate Dropdown ---
function populateCategoryDropdowns() {
  // Product category select
  productCategory.innerHTML = '<option value="" disabled selected>Select category...</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    productCategory.appendChild(opt);
  });
}

// --- Update Stats ---
function updateStats() {
  statTotalProducts.textContent = products.length;
  statOutOfStock.textContent = products.filter(p => !p.is_available).length;
  statTotalCategories.textContent = categories.length;
}

// --- UI Loaders ---
function showProductsLoader(isLoading) {
  if (isLoading) {
    adminProductsLoader.style.display = 'flex';
    adminProductsList.style.display = 'none';
  } else {
    adminProductsLoader.style.display = 'none';
    adminProductsList.style.display = 'flex';
  }
}

function showCategoriesLoader(isLoading) {
  if (isLoading) {
    adminCategoriesLoader.style.display = 'flex';
    adminCategoriesList.style.display = 'none';
  } else {
    adminCategoriesLoader.style.display = 'none';
    adminCategoriesList.style.display = 'flex';
  }
}

// --- Logout Handler ---
async function handleLogout() {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirectToLogin();
}

// =========================================================
// PRODUCTS CRUD OPERATIONS
// =========================================================

// --- Open Form Modal ---
function openProductModal(product = null) {
  productForm.reset();
  productImagesState = [];
  imagesToDeleteFromDB = [];
  previewsContainer.innerHTML = '';
  
  if (product) {
    // EDIT PRODUCT MODE
    productModalTitle.textContent = "Edit Product";
    productEditId.value = product.id;
    productName.value = product.name;
    productCategory.value = product.category_id || '';
    productPriceType.value = product.price_type;
    productPrice.value = product.price || '';
    productDescription.value = product.description || '';
    productAvailable.checked = product.is_available;

    // Handle prices visibility
    handlePriceTypeChange();

    // Populate images state
    if (product.product_images && product.product_images.length > 0) {
      product.product_images.forEach(img => {
        productImagesState.push({
          id: img.id,
          url: img.url,
          isExisting: true
        });
      });
    }

    // Existing product — show and load customization options
    optionsSection.style.display = 'block';
    loadOptionGroupsForProduct(product.id);
  } else {
    // ADD NEW PRODUCT MODE
    productModalTitle.textContent = "Add New Product";
    productEditId.value = "";
    productPriceType.value = "fixed";
    handlePriceTypeChange();

    // New product doesn't exist yet — options can't be attached until it's saved
    optionsSection.style.display = 'none';
    currentOptionGroups = [];
  }

  renderImagePreviews();
  productFormModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productFormModal.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Drag & Drop Setup ---
function setupDragAndDrop() {
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }, false);
}

async function compressImageFile(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/webp', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

function handleFileSelection(e) {
  const files = e.target.files;
  handleFiles(files);
}

async function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;

    const compressed = await compressImageFile(file);
    const previewUrl = URL.createObjectURL(compressed);
    productImagesState.push({
      file: compressed,
      previewUrl: previewUrl,
      isExisting: false
    });
  }
  renderImagePreviews();
}

// --- Render Image Previews inside Form ---
function renderImagePreviews() {
  previewsContainer.innerHTML = '';
  
  productImagesState.forEach((img, idx) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-image-item';
    
    const src = img.isExisting ? img.url : img.previewUrl;
    
    previewItem.innerHTML = `
      <img src="${src}" alt="Preview image">
      <button type="button" class="image-delete-btn" data-index="${idx}">&times;</button>
      <span class="image-sort-badge">Order: ${idx + 1}</span>
    `;

    // Delete photo listener
    previewItem.querySelector('.image-delete-btn').addEventListener('click', (e) => {
      const indexToDelete = parseInt(e.target.getAttribute('data-index'));
      const removedImage = productImagesState.splice(indexToDelete, 1)[0];
      
      if (removedImage.isExisting) {
        imagesToDeleteFromDB.push(removedImage.id);
      } else {
        // Revoke temp object URL to prevent memory leaks
        URL.revokeObjectURL(removedImage.previewUrl);
      }
      
      renderImagePreviews();
    });

    previewsContainer.appendChild(previewItem);
  });
}

// --- Render Products List ---
function renderProductsList() {
  adminProductsList.innerHTML = '';
  const searchVal = adminProductSearch.value.toLowerCase().trim();

  const filtered = products.filter(p => {
    return p.name.toLowerCase().includes(searchVal) || 
           (p.description && p.description.toLowerCase().includes(searchVal)) ||
           (p.categories?.name && p.categories.name.toLowerCase().includes(searchVal));
  });

  if (filtered.length === 0) {
    adminProductsList.innerHTML = `
      <div class="empty-state" style="padding: 30px;">
        <div class="empty-state-icon">🛋️</div>
        <h3 class="empty-state-title">No products matches your search</h3>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    
    const primaryImgUrl = product.product_images && product.product_images.length > 0 
      ? product.product_images[0].url 
      : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop';

    const priceText = formatPrice(product.price, product.price_type);

    card.innerHTML = `
      <div class="admin-item-details">
        <div class="admin-item-thumb">
          <img src="${primaryImgUrl}" alt="${escapeHTML(product.name)}">
        </div>
        <div class="admin-item-info">
          <span class="admin-item-name">${escapeHTML(product.name)}</span>
          <div class="admin-item-meta">
            <span class="admin-item-category">${escapeHTML(product.categories?.name || 'Uncategorized')}</span>
            <span class="admin-item-price">${priceText}</span>
            ${product.is_available 
              ? '<span class="badge badge-success btn-sm" style="padding: 2px 6px;">Available</span>' 
              : '<span class="badge badge-danger btn-sm" style="padding: 2px 6px;">Out of stock</span>'}
          </div>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </div>
    `;

    // Action button listeners
    card.querySelector('.edit-btn').addEventListener('click', () => openProductModal(product));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product));

    adminProductsList.appendChild(card);
  });
}

// --- Submit Product Form ---
async function handleProductSubmit(e) {
  e.preventDefault();

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const id = productEditId.value;
  const name = productName.value.trim();
  const categoryId = productCategory.value || null;
  const priceType = productPriceType.value;
  const priceVal = priceType === 'on_request' ? null : parseFloat(productPrice.value);
  const desc = productDescription.value.trim();
  const available = productAvailable.checked;

  try {
    setProductSubmitLoading(true);

    let productId = id;
    
    // 1. Insert or Update Product table row
    if (id) {
      // UPDATE
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          name: name,
          category_id: categoryId,
          price: priceVal,
          price_type: priceType,
          description: desc,
          is_available: available
        })
        .eq('id', id);

      if (updateErr) throw updateErr;
    } else {
      // INSERT
      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert({
          name: name,
          category_id: categoryId,
          price: priceVal,
          price_type: priceType,
          description: desc,
          is_available: available
        })
        .select();

      if (insertErr) throw insertErr;
      productId = newProd[0].id;
    }

    // 2. Perform images deletions from DB
    if (imagesToDeleteFromDB.length > 0) {
      const { error: delImgErr } = await supabase
        .from('product_images')
        .delete()
        .in('id', imagesToDeleteFromDB);
      
      if (delImgErr) throw delImgErr;
    }

    // 3. Perform new image uploads to storage & DB inserts
    for (let i = 0; i < productImagesState.length; i++) {
      const img = productImagesState[i];
      const sortOrder = i; // sort order corresponds to index position
      
      if (img.isExisting) {
        // Simply update the sort order of existing image
        const { error: sortErr } = await supabase
          .from('product_images')
          .update({ sort_order: sortOrder })
          .eq('id', img.id);
        
        if (sortErr) throw sortErr;
      } else {
        // Upload new file to Supabase Storage
        const fileExt = img.file.name.split('.').pop();
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 7);
        const filePath = `public/prod_${productId}_${timestamp}_${randomString}.${fileExt}`;

        // Uploading binary to 'product-images' bucket
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, img.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadErr) throw uploadErr;

        // Retrieve public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        const publicUrl = urlData.publicUrl;

        // Save URL record in product_images table
        const { error: dbImgErr } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: publicUrl,
            sort_order: sortOrder
          });

        if (dbImgErr) throw dbImgErr;
      }
    }

    closeProductModal();
    // Reload dashboard
    await loadDashboardData();

  } catch (err) {
    console.error("Product submission failed:", err.message);
    alert("Error saving product: " + err.message);
  } finally {
    setProductSubmitLoading(false);
  }
}

function setProductSubmitLoading(isLoading) {
  if (isLoading) {
    productFormSubmit.disabled = true;
    productFormSubmit.innerHTML = '<div class="spinner spinner-light"></div>';
  } else {
    productFormSubmit.disabled = false;
    productFormSubmit.textContent = 'Save Product';
  }
}

// --- Delete Product ---
async function deleteProduct(product) {
  const check = confirm(`Are you sure you want to delete "${product.name}"? This action is permanent.`);
  if (!check) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // Delete files in Storage bucket if necessary
    if (product.product_images && product.product_images.length > 0) {
      const pathsToDelete = product.product_images.map(img => {
        // Extract storage file path from URL
        // Example URL: .../storage/v1/object/public/product-images/public/file.jpg -> target "public/file.jpg"
        const parts = img.url.split('/product-images/');
        return parts.length > 1 ? parts[1] : null;
      }).filter(path => path !== null);

      if (pathsToDelete.length > 0) {
        await supabase.storage
          .from('product-images')
          .remove(pathsToDelete);
      }
    }

    // Delete product row (cascade deletes category relationships and image table rows)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) throw error;
    
    await loadDashboardData();

  } catch (error) {
    console.error("Failed to delete product:", error.message);
    alert("Failed to delete product: " + error.message);
  }
}

// =========================================================
// CATEGORIES CRUD OPERATIONS
// =========================================================

// --- Render Categories Panel List ---
function renderCategoriesList() {
  adminCategoriesList.innerHTML = '';
  
  if (categories.length === 0) {
    adminCategoriesList.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <h4 class="empty-state-title">No categories defined</h4>
        <p class="empty-state-desc">Create your first category in the form on the left.</p>
      </div>
    `;
    return;
  }

  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.style.padding = '12px 16px';
    
    // Count associated products
    const productCount = products.filter(p => p.category_id === cat.id).length;

    card.innerHTML = `
      <div class="admin-item-details">
        <div class="admin-item-info">
          <span class="admin-item-name" style="font-size: 15px;">${escapeHTML(cat.name)}</span>
          <span class="category-count" style="width: fit-content; margin-top:4px;">${productCount} product${productCount === 1 ? '' : 's'}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-secondary btn-sm cat-edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm cat-delete-btn">Delete</button>
      </div>
    `;

    // Buttons actions
    card.querySelector('.cat-edit-btn').addEventListener('click', () => editCategory(cat));
    card.querySelector('.cat-delete-btn').addEventListener('click', () => deleteCategory(cat));

    adminCategoriesList.appendChild(card);
  });
}

function editCategory(cat) {
  categoryFormTitle.textContent = "Edit Category";
  categoryEditId.value = cat.id;
  categoryNameInput.value = cat.name;
  categoryCancelBtn.style.display = 'inline-flex';
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryFormTitle.textContent = "Create Category";
  categoryEditId.value = "";
  categoryCancelBtn.style.display = 'none';
}

// --- Submit Category Form ---
async function handleCategorySubmit(e) {
  e.preventDefault();

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const id = categoryEditId.value;
  const name = categoryNameInput.value.trim();

  try {
    setCategoryLoading(true);

    if (id) {
      // UPDATE
      const { error } = await supabase
        .from('categories')
        .update({ name: name })
        .eq('id', id);
      
      if (error) throw error;
    } else {
      // INSERT
      const { error } = await supabase
        .from('categories')
        .insert({ name: name });
      
      if (error) throw error;
    }

    resetCategoryForm();
    await loadDashboardData();

  } catch (error) {
    console.error("Failed to save category:", error.message);
    alert("Failed to save category. Note: Category names must be unique. Error: " + error.message);
  } finally {
    setCategoryLoading(false);
  }
}

function setCategoryLoading(isLoading) {
  if (isLoading) {
    categorySubmitBtn.disabled = true;
    categorySubmitBtn.innerHTML = '<div class="spinner spinner-light"></div>';
  } else {
    categorySubmitBtn.disabled = false;
    categorySubmitBtn.textContent = 'Save';
  }
}

// --- Delete Category ---
async function deleteCategory(cat) {
  const productCount = products.filter(p => p.category_id === cat.id).length;
  let confirmMsg = `Are you sure you want to delete the category "${cat.name}"?`;
  if (productCount > 0) {
    confirmMsg += `\nWarning: There are ${productCount} products in this category. They will be marked as "Uncategorized".`;
  }

  const check = confirm(confirmMsg);
  if (!check) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', cat.id);

    if (error) throw error;

    await loadDashboardData();

  } catch (error) {
    console.error("Failed to delete category:", error.message);
    alert("Failed to delete category: " + error.message);
  }
}

// =========================================================
// UTILITIES / FORMATTERS
// =========================================================

function formatPrice(price, priceType) {
  if (priceType === 'on_request') return 'On Request';
  
  const formatted = price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price) : '$0';
  
  if (priceType === 'range') return `From ${formatted}`;
  return formatted;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// =========================================================
// ORDERS — VIEW & STATUS MANAGEMENT
// (Read/update only. Orders are created by public customers via
// the store, never here. RLS blocks public read entirely.)
// =========================================================

function updateOrdersBadge() {
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  if (pendingCount > 0) {
    ordersPendingBadge.textContent = pendingCount;
    ordersPendingBadge.style.display = 'inline-block';
  } else {
    ordersPendingBadge.style.display = 'none';
  }
}

function renderOrdersList() {
  adminOrdersList.innerHTML = '';
  const filterVal = ordersStatusFilter.value;

  const filtered = orders.filter(o => filterVal === 'all' || o.status === filterVal);

  if (filtered.length === 0) {
    adminOrdersList.innerHTML = `
      <div class="empty-state" style="padding: 30px;">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">No order requests${filterVal === 'all' ? ' yet' : ' with this status'}</h3>
      </div>
    `;
    return;
  }

  filtered.forEach(order => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.style.cursor = 'pointer';

    const itemCount = order.order_items ? order.order_items.length : 0;
    const orderTotal = (order.order_items || []).reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    card.innerHTML = `
      <div class="admin-item-details">
        <div class="admin-item-info">
          <span class="admin-item-name">${escapeHTML(order.customer_name)}</span>
          <span class="category-count" style="width: fit-content; margin-top:4px;">
            ${itemCount} item${itemCount === 1 ? '' : 's'} · $${orderTotal.toFixed(0)} · ${dateStr}
          </span>
        </div>
      </div>
      <div class="admin-item-actions">
        <span class="badge ${orderStatusBadgeClass(order.status)}">${capitalize(order.status)}</span>
      </div>
    `;

    card.addEventListener('click', () => openOrderDetail(order));
    adminOrdersList.appendChild(card);
  });
}

function orderStatusBadgeClass(status) {
  if (status === 'confirmed') return 'badge-success';
  if (status === 'rejected') return 'badge-danger';
  return 'badge-warning';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function openOrderDetail(order) {
  currentOrderDetail = order;
  orderDetailCustomer.textContent = order.customer_name;
  orderDetailPhone.textContent = order.phone;
  orderDetailNotes.value = order.notes || '';

  orderDetailItems.innerHTML = (order.order_items || []).map(item => {
    const product = products.find(p => p.id === item.product_id);
    const productName = product ? escapeHTML(product.name) : 'Product removed';
    const optionsList = (item.selected_options || []).map(opt => `${escapeHTML(opt.group)}: ${escapeHTML(opt.value)}`).join(', ');

    return `
      <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
        <div style="display:flex; justify-content: space-between;">
          <strong>${productName} × ${item.quantity}</strong>
          <span>$${parseFloat(item.total_price || 0).toFixed(0)}</span>
        </div>
        ${optionsList ? `<div style="font-size: 13px; color: var(--text-muted); margin-top:2px;">${optionsList}</div>` : ''}
      </div>
    `;
  }).join('');

  orderDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  orderDetailModal.classList.remove('active');
  document.body.style.overflow = '';
  currentOrderDetail = null;
}

async function submitOrderStatusChange(newStatus) {
  if (!currentOrderDetail) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, notes: orderDetailNotes.value.trim() })
      .eq('id', currentOrderDetail.id);

    if (error) throw error;

    closeOrderModal();
    await loadDashboardData();
    switchTab('orders');

  } catch (error) {
    console.error('Failed to update order:', error.message);
    alert('Failed to update order: ' + error.message);
  }
}

// =========================================================
// CUSTOM REQUESTS — "Make Your Own" submissions
// (Read/update only. Requests are created by public customers via
// the custom-request page, never here. RLS blocks public read entirely.
// There is no price field — these are always manually quoted.)
// =========================================================

function updateCustomRequestsBadge() {
  const newCount = customRequests.filter(r => r.status === 'new').length;
  if (newCount > 0) {
    customRequestsPendingBadge.textContent = newCount;
    customRequestsPendingBadge.style.display = 'inline-block';
  } else {
    customRequestsPendingBadge.style.display = 'none';
  }
}

function renderCustomRequestsList() {
  adminCustomRequestsList.innerHTML = '';
  const filterVal = customRequestsStatusFilter.value;

  const filtered = customRequests.filter(r => filterVal === 'all' || r.status === filterVal);

  if (filtered.length === 0) {
    adminCustomRequestsList.innerHTML = `
      <div class="empty-state" style="padding: 30px;">
        <div class="empty-state-icon">✏️</div>
        <h3 class="empty-state-title">No custom requests${filterVal === 'all' ? ' yet' : ' with this status'}</h3>
      </div>
    `;
    return;
  }

  filtered.forEach(req => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.style.cursor = 'pointer';

    const dateStr = new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const preview = (req.description || '').slice(0, 80) + (req.description && req.description.length > 80 ? '…' : '');

    card.innerHTML = `
      <div class="admin-item-details">
        <div class="admin-item-info">
          <span class="admin-item-name">${escapeHTML(req.customer_name)}${req.category ? ` · ${escapeHTML(req.category)}` : ''}</span>
          <span class="category-count" style="width: fit-content; margin-top:4px;">
            ${escapeHTML(preview)} · ${dateStr}
          </span>
        </div>
      </div>
      <div class="admin-item-actions">
        <span class="badge ${customRequestStatusBadgeClass(req.status)}">${formatCustomRequestStatus(req.status)}</span>
      </div>
    `;

    card.addEventListener('click', () => openCustomRequestDetail(req));
    adminCustomRequestsList.appendChild(card);
  });
}

function customRequestStatusBadgeClass(status) {
  if (status === 'quoted') return 'badge-success';
  if (status === 'closed') return 'badge-neutral';
  if (status === 'in_review') return 'badge-warning';
  return 'badge-danger'; // 'new'
}

function formatCustomRequestStatus(status) {
  return { new: 'New', in_review: 'In Review', quoted: 'Quoted', closed: 'Closed' }[status] || capitalize(status);
}

function openCustomRequestDetail(req) {
  currentCustomRequestDetail = req;
  customRequestDetailCustomer.textContent = req.customer_name;
  customRequestDetailPhone.textContent = req.phone;
  customRequestDetailCategory.textContent = req.category || 'No category picked';
  customRequestDetailDescription.textContent = req.description || '—';
  customRequestDetailNotes.value = req.admin_notes || '';
  customRequestDetailStatus.value = req.status || 'new';

  if (req.dimensions_note) {
    customRequestDetailDimensionsWrap.style.display = 'block';
    customRequestDetailDimensions.textContent = req.dimensions_note;
  } else {
    customRequestDetailDimensionsWrap.style.display = 'none';
  }

  if (req.materials_note) {
    customRequestDetailMaterialsWrap.style.display = 'block';
    customRequestDetailMaterials.textContent = req.materials_note;
  } else {
    customRequestDetailMaterialsWrap.style.display = 'none';
  }

  if (req.reference_note) {
    customRequestDetailReferenceWrap.style.display = 'block';
    if (req.reference_note.includes('data:image/')) {
      const parts = req.reference_note.split('data:image/');
      const dataUrl = 'data:image/' + parts[1];
      customRequestDetailReference.innerHTML = `
        <div style="margin-top:8px;">
          <img src="${dataUrl}" alt="Customer reference photo" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid var(--border-color);">
        </div>
      `;
    } else {
      customRequestDetailReference.textContent = req.reference_note;
    }
  } else {
    customRequestDetailReferenceWrap.style.display = 'none';
  }

  customRequestDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCustomRequestDetail() {
  customRequestDetailModal.classList.remove('active');
  document.body.style.overflow = '';
  currentCustomRequestDetail = null;
}

async function submitCustomRequestUpdate() {
  if (!currentCustomRequestDetail) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('custom_requests')
      .update({ status: customRequestDetailStatus.value, admin_notes: customRequestDetailNotes.value.trim() })
      .eq('id', currentCustomRequestDetail.id);

    if (error) throw error;

    closeCustomRequestDetail();
    await loadDashboardData();
    switchTab('custom-requests');

  } catch (error) {
    console.error('Failed to update custom request:', error.message);
    alert('Failed to update custom request: ' + error.message);
  }
}

// =========================================================
// PRODUCT CUSTOMIZATION OPTIONS
// (Option groups + values attached to a single product being edited.
// Only usable on existing products — new products must be saved first.)
// =========================================================

async function loadOptionGroupsForProduct(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  optionGroupsList.innerHTML = '<div class="spinner"></div>';

  try {
    const { data, error } = await supabase
      .from('option_groups')
      .select(`*, option_values(*)`)
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    currentOptionGroups = (data || []).map(g => {
      g.option_values = (g.option_values || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return g;
    });

    renderOptionGroups(productId);

  } catch (error) {
    console.error('Failed to load option groups:', error.message);
    optionGroupsList.innerHTML = `<p style="color: var(--danger-color, #d33);">Failed to load options: ${error.message}</p>`;
  }
}

function renderOptionGroups(productId) {
  if (currentOptionGroups.length === 0) {
    optionGroupsList.innerHTML = `<p style="font-size: 13px; color: var(--text-muted);">No option groups yet. Add one below, e.g. "Fabric" (single choice), "Add-ons" (multiple choice), or "Width" (slider/count).</p>`;
    return;
  }

  optionGroupsList.innerHTML = '';

  currentOptionGroups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'admin-item-card';
    groupEl.style.flexDirection = 'column';
    groupEl.style.alignItems = 'stretch';
    groupEl.style.marginBottom = '10px';

    const typeLabel = { select: 'Single choice', multiselect: 'Multiple choice', numeric: 'Slider / count' }[group.type] || 'Single choice';

    const headerHtml = `
      <div style="display:flex; justify-content: space-between; align-items:center;">
        <strong>${escapeHTML(group.name)} <span class="category-count" style="margin-left:6px;">${typeLabel}</span></strong>
        <button type="button" class="btn btn-danger btn-sm delete-group-btn" data-group-id="${group.id}">Delete group</button>
      </div>
    `;

    if (group.type === 'numeric') {
      groupEl.innerHTML = `
        ${headerHtml}
        <div style="display:flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size:11px;">Min</label>
            <input type="number" class="input-text range-min-input" value="${group.min_value ?? ''}" step="0.01">
          </div>
          <div style="flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size:11px;">Max</label>
            <input type="number" class="input-text range-max-input" value="${group.max_value ?? ''}" step="0.01">
          </div>
          <div style="flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size:11px;">Step</label>
            <input type="number" class="input-text range-step-input" value="${group.step ?? 1}" step="0.01">
          </div>
          <div style="flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size:11px;">Unit</label>
            <input type="text" class="input-text range-unit-input" value="${escapeHTML(group.unit_label || '')}" placeholder="cm">
          </div>
          <div style="flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size:11px;">Price / unit ($)</label>
            <input type="number" class="input-text range-price-input" value="${group.price_per_unit ?? 0}" step="0.01">
          </div>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
          Price only increases for the amount past <strong>Min</strong>. E.g. Min 120, Price/unit $3 → a value of 180 adds $180.
        </p>
        <button type="button" class="btn btn-secondary btn-sm save-range-btn" data-group-id="${group.id}" style="margin-top: 8px; align-self: flex-start;">Save range</button>
      `;

      groupEl.querySelector('.save-range-btn').addEventListener('click', () => {
        const minVal = parseFloat(groupEl.querySelector('.range-min-input').value);
        const maxVal = parseFloat(groupEl.querySelector('.range-max-input').value);
        const stepVal = parseFloat(groupEl.querySelector('.range-step-input').value) || 1;
        const unitVal = groupEl.querySelector('.range-unit-input').value.trim();
        const priceVal = parseFloat(groupEl.querySelector('.range-price-input').value) || 0;
        handleUpdateNumericRange(group.id, { min_value: minVal, max_value: maxVal, step: stepVal, unit_label: unitVal, price_per_unit: priceVal }, productId);
      });
    } else {
      const valuesHtml = (group.option_values || []).map(val => `
        <div style="display:flex; justify-content: space-between; align-items:center; padding: 6px 0;">
          <span>${escapeHTML(val.label)} <span style="color: var(--text-muted); font-size: 13px;">(${val.price_modifier >= 0 ? '+' : ''}${val.price_modifier})</span></span>
          <button type="button" class="btn btn-danger btn-sm delete-value-btn" data-value-id="${val.id}">Remove</button>
        </div>
      `).join('');

      groupEl.innerHTML = `
        ${headerHtml}
        <div class="option-values-list">${valuesHtml}</div>
        <div style="display:flex; gap: 8px; margin-top: 8px;">
          <input type="text" class="input-text new-value-label" placeholder="e.g. Velvet" style="flex: 2;">
          <input type="number" class="input-text new-value-price" placeholder="+500" step="0.01" style="flex: 1;">
          <button type="button" class="btn btn-secondary btn-sm add-value-btn" data-group-id="${group.id}">Add</button>
        </div>
      `;

      groupEl.querySelectorAll('.delete-value-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteOptionValue(btn.dataset.valueId, productId));
      });
      groupEl.querySelector('.add-value-btn').addEventListener('click', () => {
        const labelInput = groupEl.querySelector('.new-value-label');
        const priceInput = groupEl.querySelector('.new-value-price');
        handleAddOptionValue(group.id, labelInput.value, priceInput.value, productId);
      });
    }

    groupEl.querySelector('.delete-group-btn').addEventListener('click', () => deleteOptionGroup(group.id, productId));

    optionGroupsList.appendChild(groupEl);
  });
}

async function handleUpdateNumericRange(groupId, range, productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('option_groups')
      .update(range)
      .eq('id', groupId);

    if (error) throw error;
    await loadOptionGroupsForProduct(productId);

  } catch (error) {
    console.error('Failed to save range:', error.message);
    alert('Failed to save range: ' + error.message);
  }
}

async function handleAddOptionGroup() {
  const productId = productEditId.value;
  if (!productId) {
    alert('Save the product first, then reopen it to add customization options.');
    return;
  }

  const name = newOptionGroupName.value.trim();
  if (!name) return;
  const type = newOptionGroupType.value;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = { product_id: productId, name: name, type: type, sort_order: currentOptionGroups.length };
    if (type === 'numeric') {
      payload.min_value = 0;
      payload.max_value = 100;
      payload.step = 1;
      payload.unit_label = '';
      payload.price_per_unit = 0;
    }

    const { error } = await supabase
      .from('option_groups')
      .insert(payload);

    if (error) throw error;

    newOptionGroupName.value = '';
    await loadOptionGroupsForProduct(productId);

  } catch (error) {
    console.error('Failed to add option group:', error.message);
    alert('Failed to add option group: ' + error.message);
  }
}

async function deleteOptionGroup(groupId, productId) {
  const check = confirm('Delete this option group and all its values?');
  if (!check) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('option_groups').delete().eq('id', groupId);
    if (error) throw error;
    await loadOptionGroupsForProduct(productId);
  } catch (error) {
    console.error('Failed to delete option group:', error.message);
    alert('Failed to delete option group: ' + error.message);
  }
}

async function handleAddOptionValue(groupId, label, priceStr, productId) {
  label = (label || '').trim();
  if (!label) return;
  const priceModifier = parseFloat(priceStr) || 0;

  const group = currentOptionGroups.find(g => g.id === groupId);
  const sortOrder = group ? (group.option_values || []).length : 0;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('option_values')
      .insert({ option_group_id: groupId, label: label, price_modifier: priceModifier, sort_order: sortOrder });

    if (error) throw error;
    await loadOptionGroupsForProduct(productId);

  } catch (error) {
    console.error('Failed to add option value:', error.message);
    alert('Failed to add option value: ' + error.message);
  }
}

async function deleteOptionValue(valueId, productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('option_values').delete().eq('id', valueId);
    if (error) throw error;
    await loadOptionGroupsForProduct(productId);
  } catch (error) {
    console.error('Failed to delete option value:', error.message);
    alert('Failed to delete option value: ' + error.message);
  }
}
