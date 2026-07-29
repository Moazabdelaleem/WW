// catalog.js
// Logic for the public catalog page.

import { getSupabaseClient, isSupabaseConfigured, isUsingLocalMode, saveSupabaseConfig } from './supabaseClient.js';
import { switchDemoPreset } from './localBackend.js';
import { t, tr } from './i18n.js';
// --- State Variables ---
let products = [];
let categories = [];
let activeDepartment = 'all'; // 'all', 'home', 'carpentry', 'office'
let activeCategory = 'all';
let searchQuery = '';
let activePriceType = 'all';
let availableOnly = false;
let currentModalImages = [];
let currentModalImageIndex = 0;
let currentProduct = null;
let currentOptionGroups = []; // option groups + values for the product currently open in the modal
let selectedOptions = {}; // { groupId: { groupName, valueId, label, priceModifier } }

const DEPT_CATEGORY_MAP = {
  home: ['Living Room', 'Dining Room', 'Bedroom', 'Outdoor'],
  carpentry: ['Bespoke Doors', 'Wall Paneling', 'Custom Wardrobes'],
  office: ['Desks & Workstations', 'Seating', 'Conference'],
};

function isCategoryInDepartment(catName) {
  if (activeDepartment === 'all') return true;
  const allowed = DEPT_CATEGORY_MAP[activeDepartment] || [];
  return allowed.includes(catName);
}

// --- DOM Elements ---
const catalogLoader = document.getElementById('catalog-loader');
const productsGrid = document.getElementById('products-grid');
const categoryBar = document.getElementById('category-bar');
const searchInput = document.getElementById('search-input');
const priceTypeFilter = document.getElementById('price-type-filter');
const availableOnlyToggle = document.getElementById('available-only-toggle');
const productsCountLabel = document.getElementById('products-count-label');

// Drawer Elements
const productDetailModal = document.getElementById('product-detail-modal');
const closeDetailModalBtn = document.getElementById('close-detail-modal');
const detailCategory = document.getElementById('detail-category');
const detailTitle = document.getElementById('detail-title');
const detailPrice = document.getElementById('detail-price');
const detailPriceType = document.getElementById('detail-price-type');
const detailDescription = document.getElementById('detail-description');
const detailStatusBox = document.getElementById('detail-status-box');

// Options & Order Request Elements
const detailOptionsContainer = document.getElementById('detail-options-container');
const orderQuantity = document.getElementById('order-quantity');
const orderFormFields = document.getElementById('order-form-fields');
const orderCustomerName = document.getElementById('order-customer-name');
const orderCustomerPhone = document.getElementById('order-customer-phone');
const orderCustomerNotes = document.getElementById('order-customer-notes');
const orderRequestBtn = document.getElementById('order-request-btn');
const whatsappOrderBtn = document.getElementById('whatsapp-order-btn');
const orderSuccessMsg = document.getElementById('order-success-msg');

// Setup Config Modal Elements
const supabaseConfigModal = document.getElementById('supabase-config-modal');
const configSetupForm = document.getElementById('config-setup-form');
const configUrlInput = document.getElementById('config-url');
const configAnonKeyInput = document.getElementById('config-anon-key');

// Proposal Pitch Banner Elements
const demoPresetSelect = document.getElementById('demo-preset-select');

// --- Toast Notification Helper ---
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  if (isUsingLocalMode()) {
    const badge = document.getElementById('local-mode-badge');
    if (badge) badge.style.display = 'inline-block';
  }

  // Transparent header on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Proposal Demo Preset Selector setup
  if (demoPresetSelect) {
    const savedPreset = localStorage.getItem('DEMO_PRESET_KEY') || 'living_room';
    demoPresetSelect.value = savedPreset;

    demoPresetSelect.addEventListener('change', (e) => {
      if (isUsingLocalMode()) {
        switchDemoPreset(e.target.value);
        showToast('Switched catalog niche preset!', 'info');
        setTimeout(() => window.location.reload(), 300);
      } else {
        showToast('Niche switcher works in Local Demo Mode.', 'warning');
      }
    });
  }

  initializeCatalog();
  setupEventListeners();
});

// --- Config Modal logic ---
function showConfigModal() {
  supabaseConfigModal.classList.add('active');
  configSetupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = configUrlInput.value;
    const key = configAnonKeyInput.value;
    saveSupabaseConfig(url, key);
  });
}

// --- Fetch Data & Load Catalog ---
async function initializeCatalog() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    showLoader(true);

    // 1. Fetch categories
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (catError) throw catError;
    categories = categoriesData || [];

    // 2. Fetch products including images (joined product_images table)
    // Only fetch available products or all products (we filter availability client-side)
    const { data: productsData, error: prodError } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(url, sort_order)
      `)
      .order('created_at', { ascending: false });

    if (prodError) throw prodError;
    products = productsData || [];

    // Process product images sorting
    products.forEach(p => {
      if (p.product_images && p.product_images.length > 0) {
        p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    });

    // 3. Render
    renderCategories();
    renderProducts();

  } catch (error) {
    console.error("Error loading catalog:", error.message);
    showToast("Could not load data from Supabase.", "warning");
  } finally {
    showLoader(false);
  }
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  // Main Category Dropdown Selector
  const departmentSelect = document.getElementById('department-select');
  if (departmentSelect) {
    departmentSelect.addEventListener('change', (e) => {
      activeDepartment = e.target.value;
      activeCategory = 'all'; // reset sub-category pill selection
      renderCategories();
      renderProducts();
    });
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
  });

  // Price Type Filter
  priceTypeFilter.addEventListener('change', (e) => {
    activePriceType = e.target.value;
    renderProducts();
  });

  // Availability Toggle
  availableOnlyToggle.addEventListener('change', (e) => {
    availableOnly = e.target.checked;
    renderProducts();
  });

  // Drawer closing — close button or backdrop click
  closeDetailModalBtn.addEventListener('click', closeProductModal);
  productDetailModal.addEventListener('click', (e) => {
    if (!e.target.closest('.drawer-panel')) closeProductModal();
  });

  // Quantity change recalculates live price
  orderQuantity.addEventListener('input', updateLivePrice);

  // Submit order request
  orderRequestBtn.addEventListener('click', handleOrderRequestSubmit);

  // WhatsApp order action
  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', handleWhatsAppOrder);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      window.location.href = 'admin/login.html';
      return;
    }
    if (!productDetailModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeProductModal();
  });
}

// --- WhatsApp Direct Order Handler ---
function handleWhatsAppOrder() {
  if (!currentProduct) return;

  const name = orderCustomerName.value.trim() || '';
  const phone = orderCustomerPhone.value.trim() || '';
  const notes = orderCustomerNotes.value.trim() || '';
  const quantity = Math.max(1, parseInt(orderQuantity.value) || 1);

  const selectedOptionsList = [];
  Object.values(selectedOptions).forEach(opt => {
    if (opt.type === 'multiselect') {
      (opt.values || []).forEach(v => selectedOptionsList.push(`${opt.groupName}: ${v.label}`));
    } else if (opt.type === 'numeric') {
      selectedOptionsList.push(`${opt.groupName}: ${opt.value}${opt.unit ? ' ' + opt.unit : ''}`);
    } else if (opt.label) {
      selectedOptionsList.push(`${opt.groupName}: ${opt.label}`);
    }
  });

  const priceText = currentProduct.price_type === 'on_request'
    ? 'Price on Request'
    : `$${calculateTotalPrice().toLocaleString()}`;

  let message = `Hello ArtisanWood! 👋\nI would like to order:\n\n` +
    `📌 *Product:* ${currentProduct.name}\n` +
    `🔢 *Quantity:* ${quantity}\n` +
    `💰 *Estimated Total:* ${priceText}\n`;

  if (selectedOptionsList.length > 0) {
    message += `🎨 *Options:*\n - ${selectedOptionsList.join('\n - ')}\n`;
  }

  if (name) message += `\n👤 *Customer Name:* ${name}`;
  if (phone) message += `\n📞 *Phone:* ${phone}`;
  if (notes) message += `\n📝 *Notes:* ${notes}`;

  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
  showToast('Opening WhatsApp with your pre-filled order!', 'success');
}

// --- Loader Helper ---
function showLoader(isLoading) {
  if (isLoading) {
    catalogLoader.style.display = 'flex';
    productsGrid.style.display = 'none';
  } else {
    catalogLoader.style.display = 'none';
    productsGrid.style.display = 'grid';
  }
}

// --- Render Category Pill Bar ---
function renderCategories() {
  categoryBar.innerHTML = '';

  const visibleCategories = categories.filter(cat => isCategoryInDepartment(cat.name));

  const totalCount = products.filter(p => {
    const catObj = categories.find(c => c.id === p.category_id);
    const catName = catObj ? catObj.name : (p.categories ? p.categories.name : '');
    return isCategoryInDepartment(catName);
  }).length;

  // "All" pill
  const allPill = document.createElement('button');
  allPill.className = `category-pill ${activeCategory === 'all' ? 'active' : ''}`;
  allPill.dataset.category = 'all';
  allPill.innerHTML = `${t('filter.allFurniture')} <span class="pill-count">${totalCount}</span>`;
  categoryBar.appendChild(allPill);

  // One pill per category in current department
  visibleCategories.forEach(cat => {
    const count = products.filter(p => p.category_id === cat.id).length;
    const pill = document.createElement('button');
    pill.className = `category-pill ${activeCategory === cat.id ? 'active' : ''}`;
    pill.dataset.category = cat.id;
    pill.innerHTML = `${escapeHTML(tr(cat.name))} <span class="pill-count">${count}</span>`;
    categoryBar.appendChild(pill);
  });

  // Event delegation
  categoryBar.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      categoryBar.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderProducts();
    });
  });
}

// --- Render Products Grid (portrait cards) ---
function renderProducts() {
  productsGrid.innerHTML = '';

  // Apply filters
  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery) || tr(product.name).toLowerCase().includes(searchQuery);
    const descMatch = (product.description && product.description.toLowerCase().includes(searchQuery)) ||
      (product.description && tr(product.description).toLowerCase().includes(searchQuery));
    const matchesSearch = nameMatch || descMatch;

    const catObj = categories.find(c => c.id === product.category_id);
    const catName = catObj ? catObj.name : (product.categories ? product.categories.name : '');
    const matchesDept = isCategoryInDepartment(catName);

    const matchesCategory = activeCategory === 'all' || product.category_id === activeCategory;
    const matchesPriceType = activePriceType === 'all' || product.price_type === activePriceType;
    const matchesAvailability = !availableOnly || product.is_available;
    return matchesSearch && matchesDept && matchesCategory && matchesPriceType && matchesAvailability;
  });

  // Update count label
  productsCountLabel.textContent = t('products.showingCount', { n: filteredProducts.length });

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛋️</div>
        <h3 class="empty-state-title">No pieces found</h3>
        <p class="empty-state-desc">Try adjusting your filters or search terms.</p>
        <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top:16px;">Reset filters</button>
      </div>
    `;
    return;
  }

  // Render portrait cards
  filteredProducts.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal-card';
    card.style.setProperty('--reveal-delay', `${Math.min(index * 55, 400)}ms`);

    const imgs = product.product_images || [];
    const primaryImg = imgs[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop';
    const secondaryImg = imgs[1]?.url || null;
    const priceDisplay = formatPrice(product.price, product.price_type);
    const categoryName = escapeHTML(tr(product.categories?.name || 'Uncategorized'));
    const productName = escapeHTML(tr(product.name));
    const desc = escapeHTML(tr(product.description || ''));
    const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop';

    card.innerHTML = `
      <div class="product-card-img-wrapper">
        <img class="product-card-img product-card-img-primary" src="${primaryImg}" alt="${productName}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}';">
        ${secondaryImg ? `<img class="product-card-img product-card-img-secondary" src="${secondaryImg}" alt="${productName}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}';">` : ''}
        <div class="product-card-overlay">
          <span class="product-card-category-overlay">${categoryName}</span>
          <p class="product-card-desc-overlay">${desc}</p>
          <span class="product-card-view-btn">${tr('View Details →')}</span>
        </div>
      </div>
      <div class="product-card-base">
        <div>
          <h3 class="product-card-title">${productName}</h3>
          <span class="product-card-price">${priceDisplay}</span>
        </div>
        ${!product.is_available ? `<span class="badge badge-danger" style="font-size:10px;">${tr('Made to Order')}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => openProductModal(product));
    productsGrid.appendChild(card);
  });

  // Trigger scroll-reveal
  setTimeout(observeCards, 50);
}

// --- Open Product Drawer ---
function openProductModal(product) {
  currentProduct = product;
  selectedOptions = {};

  // Reset order form state
  orderQuantity.value = 1;
  orderCustomerName.value = '';
  orderCustomerPhone.value = '';
  orderCustomerNotes.value = '';
  orderFormFields.style.display = 'block';
  orderSuccessMsg.style.display = 'none';
  orderRequestBtn.style.display = 'block';
  orderRequestBtn.disabled = false;
  orderRequestBtn.textContent = t('detail.requestBtn');

  // Fill content fields
  detailCategory.textContent = tr(product.categories?.name || t('common.uncategorized'));
  detailTitle.textContent = tr(product.name);
  detailDescription.textContent = tr(product.description || t('common.noDescription'));
  detailPrice.textContent = formatPriceText(product.price, product.price_type);
  detailPriceType.textContent = formatPriceLabel(product.price_type);

  detailStatusBox.innerHTML = product.is_available
    ? `<span class="badge badge-success">${tr('Currently Available')}</span>`
    : `<span class="badge badge-danger">${tr('Made to Order / Out of Stock')}</span>`;

  // Load customization options
  loadOptionsForProduct(product.id);

  // Build stacked image gallery
  currentModalImages = product.product_images && product.product_images.length > 0
    ? product.product_images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop'];

  currentModalImageIndex = 0;
  renderDrawerGallery();

  // Open the drawer
  productDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Scroll drawer to top
  const panel = productDetailModal.querySelector('.drawer-panel');
  if (panel) panel.scrollTop = 0;
}

// --- Stacked Gallery Renderer ---
function renderDrawerGallery() {
  const container = document.getElementById('drawer-gallery-container');
  if (!container) return;
  container.innerHTML = '';
  const fallbackImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop';

  currentModalImages.forEach((url, idx) => {
    const item = document.createElement('div');
    item.className = `drawer-gallery-item${idx === 0 ? ' drawer-gallery-item-main' : ''}`;
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Product view ${idx + 1}`;
    img.loading = idx === 0 ? 'eager' : 'lazy';
    img.onerror = () => { img.onerror = null; img.src = fallbackImg; };
    item.appendChild(img);
    container.appendChild(item);
  });
}

// --- Gallery Navigation (scrolls to image in stacked view) ---
function updateModalImage() {
  const container = document.getElementById('drawer-gallery-container');
  const items = container?.querySelectorAll('.drawer-gallery-item');
  items?.forEach((item, idx) => {
    item.style.outline = idx === currentModalImageIndex
      ? '3px solid var(--accent-500)'
      : 'none';
  });
}

function navigateGallery(direction) {
  currentModalImageIndex += direction;
  if (currentModalImageIndex < 0) currentModalImageIndex = currentModalImages.length - 1;
  else if (currentModalImageIndex >= currentModalImages.length) currentModalImageIndex = 0;
  updateModalImage();
  const container = document.getElementById('drawer-gallery-container');
  const items = container?.querySelectorAll('.drawer-gallery-item');
  if (items?.[currentModalImageIndex]) {
    items[currentModalImageIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// --- Scroll Reveal via IntersectionObserver ---
let revealObserver = null;

function observeCards() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-card:not(.revealed)').forEach(card => revealObserver.observe(card));
}

// --- Reset All Filters ---
function resetFilters() {
  searchInput.value = '';
  searchQuery = '';
  priceTypeFilter.value = 'all';
  activePriceType = 'all';
  availableOnlyToggle.checked = false;
  availableOnly = false;
  activeCategory = 'all';
  renderCategories();
  renderProducts();
}

// --- Close Drawer ---
function closeProductModal() {
  productDetailModal.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Text Formatting Helpers ---
function formatPrice(price, priceType) {
  if (priceType === 'on_request') return 'On Request';

  const formatted = price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price) : '$0';

  if (priceType === 'range') return `From ${formatted}`;
  return formatted;
}

function formatPriceText(price, priceType) {
  if (priceType === 'on_request') return 'On Request';
  return price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price) : '$0';
}

function formatPriceLabel(priceType) {
  switch (priceType) {
    case 'fixed': return '(Fixed)';
    case 'range': return '(Starting Price)';
    case 'on_request': return '';
    default: return '';
  }
}

// --- HTML Escape Helper ---
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
// PRODUCT CUSTOMIZATION OPTIONS (public — read only)
// =========================================================

async function loadOptionsForProduct(productId) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  detailOptionsContainer.innerHTML = '';

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

    renderOptionSelectors();
    updateLivePrice();

  } catch (error) {
    console.error('Failed to load customization options:', error.message);
    // Fail quietly on the public site — a product with no options is a normal case
    currentOptionGroups = [];
  }
}

function renderOptionSelectors() {
  detailOptionsContainer.innerHTML = '';

  currentOptionGroups.forEach(group => {
    if (group.type === 'numeric') {
      renderNumericGroup(group);
      return;
    }

    if (!group.option_values || group.option_values.length === 0) return;

    if (group.type === 'multiselect') {
      renderMultiselectGroup(group);
    } else {
      renderSelectGroup(group);
    }
  });
}

// --- Single-choice group (radio-style pills) ---
function renderSelectGroup(group) {
  const groupEl = document.createElement('div');
  groupEl.className = 'option-swatch-group';

  const valuesHtml = group.option_values.map(val => `
    <button type="button" class="option-value-btn" data-group-id="${group.id}" data-value-id="${val.id}">
      ${escapeHTML(tr(val.label))}${val.price_modifier ? ` (${val.price_modifier > 0 ? '+' : ''}${val.price_modifier})` : ''}
    </button>
  `).join('');

  groupEl.innerHTML = `<span class="option-group-title">${escapeHTML(tr(group.name))} <span style="font-weight:400; color: var(--text-muted); font-size: 12px;">${t('common.pickAny')}</span></span>${valuesHtml}`;
  detailOptionsContainer.appendChild(groupEl);

  const firstVal = group.option_values[0];
  selectedOptions[group.id] = {
    type: 'select',
    groupName: tr(group.name),
    valueId: firstVal.id,
    label: tr(firstVal.label),
    priceModifier: parseFloat(firstVal.price_modifier) || 0,
  };

  groupEl.querySelectorAll('.option-value-btn').forEach(btn => {
    const valueId = btn.dataset.valueId;
    if (selectedOptions[group.id].valueId === valueId) btn.classList.add('selected');

    btn.addEventListener('click', () => {
      const value = group.option_values.find(v => v.id === valueId);
      selectedOptions[group.id] = {
        type: 'select',
        groupName: tr(group.name),
        valueId: value.id,
        label: tr(value.label),
        priceModifier: parseFloat(value.price_modifier) || 0,
      };
      groupEl.querySelectorAll('.option-value-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateLivePrice();
    });
  });
}

// --- Multiple-choice group (toggleable pills, any number selected) ---
function renderMultiselectGroup(group) {
  const groupEl = document.createElement('div');
  groupEl.className = 'option-swatch-group';

  const valuesHtml = group.option_values.map(val => `
    <button type="button" class="option-value-btn" data-group-id="${group.id}" data-value-id="${val.id}">
      ${escapeHTML(tr(val.label))}${val.price_modifier ? ` (${val.price_modifier > 0 ? '+' : ''}${val.price_modifier})` : ''}
    </button>
  `).join('');

  groupEl.innerHTML = `<span class="option-group-title">${escapeHTML(tr(group.name))} <span style="font-weight:400; color: var(--text-muted); font-size: 12px;">${t('common.pickAny')}</span></span>${valuesHtml}`;
  detailOptionsContainer.appendChild(groupEl);

  selectedOptions[group.id] = { type: 'multiselect', groupName: tr(group.name), values: [], priceModifier: 0 };

  groupEl.querySelectorAll('.option-value-btn').forEach(btn => {
    const valueId = btn.dataset.valueId;
    btn.addEventListener('click', () => {
      const value = group.option_values.find(v => v.id === valueId);
      const state = selectedOptions[group.id];
      const idx = state.values.findIndex(v => v.valueId === valueId);

      if (idx >= 0) {
        state.values.splice(idx, 1);
        btn.classList.remove('selected');
      } else {
        state.values.push({ valueId: value.id, label: tr(value.label), priceModifier: parseFloat(value.price_modifier) || 0 });
        btn.classList.add('selected');
      }
      state.priceModifier = state.values.reduce((sum, v) => sum + v.priceModifier, 0);
      updateLivePrice();
    });
  });
}

// --- Numeric group: a slider for continuous ranges, a +/- stepper for whole-number counts ---
function renderNumericGroup(group) {
  const min = parseFloat(group.min_value) || 0;
  const max = parseFloat(group.max_value) || (min + 100);
  const step = parseFloat(group.step) || 1;
  const unit = group.unit_label || '';
  const pricePerUnit = parseFloat(group.price_per_unit) || 0;
  const isStepper = Number.isInteger(step) && step >= 1;

  const groupEl = document.createElement('div');
  groupEl.className = 'option-swatch-group';

  const valueLabelId = `numeric-value-${group.id}`;

  if (isStepper) {
    groupEl.innerHTML = `
      <span class="option-group-title">${escapeHTML(tr(group.name))}</span>
      <div class="numeric-stepper">
        <button type="button" class="stepper-btn stepper-minus" data-group-id="${group.id}">–</button>
        <span class="stepper-value" id="${valueLabelId}">${min}${unit ? ' ' + unit : ''}</span>
        <button type="button" class="stepper-btn stepper-plus" data-group-id="${group.id}">+</button>
      </div>
    `;
  } else {
    groupEl.innerHTML = `
      <span class="option-group-title">${escapeHTML(tr(group.name))}: <span id="${valueLabelId}">${min}${unit ? ' ' + unit : ''}</span></span>
      <input type="range" class="option-range-input" data-group-id="${group.id}" min="${min}" max="${max}" step="${step}" value="${min}">
    `;
  }

  detailOptionsContainer.appendChild(groupEl);

  const applyValue = (value) => {
    const modifier = Math.max(0, value - min) * pricePerUnit;
    selectedOptions[group.id] = { type: 'numeric', groupName: tr(group.name), value, unit, priceModifier: modifier };
    const label = document.getElementById(valueLabelId);
    if (label) label.textContent = `${value}${unit ? ' ' + unit : ''}`;
    updateLivePrice();
  };

  applyValue(min);

  if (isStepper) {
    let current = min;
    groupEl.querySelector('.stepper-minus').addEventListener('click', () => {
      current = Math.max(min, current - step);
      applyValue(current);
    });
    groupEl.querySelector('.stepper-plus').addEventListener('click', () => {
      current = Math.min(max, current + step);
      applyValue(current);
    });
  } else {
    groupEl.querySelector('.option-range-input').addEventListener('input', (e) => {
      applyValue(parseFloat(e.target.value));
    });
  }
}

// Re-render catalog dynamically on language switch
document.addEventListener('langchange', () => {
  renderCategories();
  renderProducts();
  if (productDetailModal && productDetailModal.classList.contains('active') && currentProduct) {
    openProductModal(currentProduct);
  }
});

function calculateTotalPrice() {
  if (!currentProduct) return 0;
  const basePrice = parseFloat(currentProduct.price) || 0;
  const optionsTotal = Object.values(selectedOptions).reduce((sum, opt) => sum + (opt.priceModifier || 0), 0);
  const quantity = Math.max(1, parseInt(orderQuantity.value) || 1);
  return (basePrice + optionsTotal) * quantity;
}

function updateLivePrice() {
  if (!currentProduct) return;

  if (currentProduct.price_type === 'on_request') {
    detailPrice.textContent = t('common.onRequest');
    return;
  }

  const total = calculateTotalPrice();
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
  detailPrice.textContent = currentProduct.price_type === 'range' ? t('common.fromPrice', { p: formatted }) : formatted;
}

// =========================================================
// ORDER REQUEST SUBMISSION (public — insert only, per RLS)
// =========================================================

async function handleOrderRequestSubmit() {
  if (!currentProduct) return;

  const name = orderCustomerName.value.trim();
  const phone = orderCustomerPhone.value.trim();
  const notes = orderCustomerNotes.value.trim();
  const quantity = Math.max(1, parseInt(orderQuantity.value) || 1);

  if (!name || !phone) {
    alert(t('detail.nameRequired'));
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const totalPrice = currentProduct.price_type === 'on_request' ? null : calculateTotalPrice();

  try {
    orderRequestBtn.disabled = true;
    orderRequestBtn.textContent = t('common.sending');

    // 1. Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ customer_name: name, phone: phone, notes: notes, status: 'pending' })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create the order item, recording the price and options AT THE TIME of the request
    const selectedOptionsArray = [];
    Object.values(selectedOptions).forEach(opt => {
      if (opt.type === 'multiselect') {
        (opt.values || []).forEach(v => selectedOptionsArray.push({ group: opt.groupName, value: v.label, price_modifier: v.priceModifier }));
      } else if (opt.type === 'numeric') {
        selectedOptionsArray.push({ group: opt.groupName, value: `${opt.value}${opt.unit ? ' ' + opt.unit : ''}`, price_modifier: opt.priceModifier });
      } else {
        selectedOptionsArray.push({ group: opt.groupName, value: opt.label, price_modifier: opt.priceModifier });
      }
    });

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderData.id,
        product_id: currentProduct.id,
        quantity: quantity,
        selected_options: selectedOptionsArray,
        total_price: totalPrice
      });

    if (itemError) throw itemError;

    // Success state
    orderFormFields.style.display = 'none';
    orderRequestBtn.style.display = 'none';
    orderSuccessMsg.style.display = 'block';

  } catch (error) {
    console.error('Failed to submit order request:', error.message);
    alert('Could not send your request: ' + error.message);
    orderRequestBtn.disabled = false;
    orderRequestBtn.textContent = t('detail.requestBtn');
  }
}
