// localBackend.js
//
// A localStorage-backed mock of the Supabase JS client. It implements just
// enough of the real API surface (auth, storage, .from().select/insert/
// update/delete/eq/in/order/single) for catalog.js / admin.js / auth.js to
// work completely unchanged, with zero backend setup.
//
// This exists so the app runs fully offline, in one browser, with no
// Supabase project required. It is NOT a shared backend: data lives only in
// the browser's localStorage on the device that wrote it. Two different
// visitors (or the same person on two different devices) do NOT see the
// same catalog. Before this goes live for real customers, swap in a real
// Supabase project via "Configure Database Connection" — nothing else in
// the app needs to change, because the rest of the code only ever talks to
// the object returned by getSupabaseClient().

const DB_KEY = 'LOCAL_DB_V1';
const IMAGE_STORE_KEY = 'LOCAL_IMAGE_STORE_V1';
const SESSION_KEY = 'LOCAL_AUTH_SESSION';
const ADMIN_EMAIL_KEY = 'LOCAL_ADMIN_EMAIL';
const ADMIN_PASSWORD_KEY = 'LOCAL_ADMIN_PASSWORD';

export const DEFAULT_ADMIN_EMAIL = 'admin@local.test';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

// --- Small helpers -----------------------------------------------------

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// --- Relationship map (mirrors the foreign keys in supabase/schema*.sql) ---

const RELATIONS = {
  products: {
    categories: { type: 'one', foreignTable: 'categories', localKey: 'category_id', foreignKey: 'id' },
    product_images: { type: 'many', foreignTable: 'product_images', localKey: 'id', foreignKey: 'product_id' },
  },
  orders: {
    order_items: { type: 'many', foreignTable: 'order_items', localKey: 'id', foreignKey: 'order_id' },
  },
  option_groups: {
    option_values: { type: 'many', foreignTable: 'option_values', localKey: 'id', foreignKey: 'option_group_id' },
  },
};

// on delete cascade
const CASCADE_DELETE = {
  products: [
    { table: 'product_images', fk: 'product_id' },
    { table: 'option_groups', fk: 'product_id' },
  ],
  option_groups: [{ table: 'option_values', fk: 'option_group_id' }],
  orders: [{ table: 'order_items', fk: 'order_id' }],
};

// on delete set null
const SET_NULL_ON_DELETE = {
  categories: [{ table: 'products', fk: 'category_id' }],
};

const TABLE_DEFAULTS = {
  orders: (row) => ({ status: row.status || 'pending' }),
  products: (row) => ({ is_available: row.is_available === undefined ? true : row.is_available }),
  product_images: (row) => ({ sort_order: row.sort_order ?? 0 }),
  option_groups: (row) => ({
    type: row.type || 'select',
    sort_order: row.sort_order ?? 0,
    step: row.step ?? 1,
    price_per_unit: row.price_per_unit ?? 0,
  }),
  option_values: (row) => ({ price_modifier: row.price_modifier ?? 0, sort_order: row.sort_order ?? 0 }),
  order_items: (row) => ({ quantity: row.quantity ?? 1, selected_options: row.selected_options ?? [] }),
  custom_requests: (row) => ({ status: row.status || 'new' }),
};

// --- Seed data (only used the very first time, when localStorage is empty) ---

function seedDB() {
  const catLiving = uuid();
  const catDining = uuid();
  const catBedroom = uuid();
  const catOutdoor = uuid();
  const catDoors = uuid();
  const catWall = uuid();
  const catWardrobes = uuid();
  const catDesks = uuid();
  const catSeating = uuid();
  const catConference = uuid();

  const categories = [
    { id: catLiving, name: 'Living Room', created_at: nowIso() },
    { id: catDining, name: 'Dining Room', created_at: nowIso() },
    { id: catBedroom, name: 'Bedroom', created_at: nowIso() },
    { id: catOutdoor, name: 'Outdoor', created_at: nowIso() },
    { id: catDoors, name: 'Bespoke Doors', created_at: nowIso() },
    { id: catWall, name: 'Wall Paneling', created_at: nowIso() },
    { id: catWardrobes, name: 'Custom Wardrobes', created_at: nowIso() },
    { id: catDesks, name: 'Desks & Workstations', created_at: nowIso() },
    { id: catSeating, name: 'Seating', created_at: nowIso() },
    { id: catConference, name: 'Conference', created_at: nowIso() },
  ];

  const p1 = uuid();
  const p2 = uuid();
  const p3 = uuid();
  const p4 = uuid();
  const p5 = uuid();
  const p6 = uuid();
  const p7 = uuid();
  const p8 = uuid();
  const p9 = uuid();
  const p10 = uuid();
  const p11 = uuid();

  const products = [
    { id: p1, name: 'Oakhurst Dining Table', category_id: catDining, price: 1250, price_type: 'fixed', description: 'Solid oak dining table, hand-finished, seats six comfortably.', is_available: true, created_at: nowIso() },
    { id: p2, name: 'Wraith Lounge Sofa', category_id: catLiving, price: 1800, price_type: 'range', description: 'Three-seater sofa with a solid pine frame. Choose your own fabric.', is_available: true, created_at: nowIso() },
    { id: p3, name: 'Solene Platform Bed', category_id: catBedroom, price: 950, price_type: 'fixed', description: 'Low-profile platform bed frame in walnut veneer, queen size.', is_available: false, created_at: nowIso() },
    { id: p4, name: 'Custom Teak Bench', category_id: catOutdoor, price: null, price_type: 'on_request', description: 'Weather-treated teak bench, built to your dimensions.', is_available: true, created_at: nowIso() },
    { id: p5, name: 'Aria Accent Chair', category_id: catLiving, price: 620, price_type: 'fixed', description: 'Compact accent chair with brass legs and a curved backrest.', is_available: true, created_at: nowIso() },
    { id: p6, name: 'Solid Oak Entrance Door', category_id: catDoors, price: 1850, price_type: 'fixed', description: 'Handcrafted solid oak door with brass ironmongery and weather sealing.', is_available: true, created_at: nowIso() },
    { id: p7, name: 'Walnut Acoustic Wall Panels', category_id: catWall, price: 240, price_type: 'range', description: 'Natural walnut wood slat acoustic panels for luxury interior accent walls.', is_available: true, created_at: nowIso() },
    { id: p8, name: 'Fitted Master Wardrobe', category_id: catWardrobes, price: null, price_type: 'on_request', description: 'Floor-to-ceiling built-in wardrobe with soft-close drawers and LED strip channels.', is_available: true, created_at: nowIso() },
    { id: p9, name: 'Executive Mahogany Desk', category_id: catDesks, price: 2100, price_type: 'fixed', description: 'Spacious executive desk with integrated cable management and leather inlay.', is_available: true, created_at: nowIso() },
    { id: p10, name: 'Ergonomic Mesh Manager Chair', category_id: catSeating, price: 580, price_type: 'fixed', description: 'Full lumbar support with aluminum base and breathable mesh back.', is_available: true, created_at: nowIso() },
    { id: p11, name: '10-Person Conference Table', category_id: catConference, price: 3400, price_type: 'range', description: 'Solid teak top conference table with built-in power hubs.', is_available: true, created_at: nowIso() },
  ];

  const product_images = [
    { id: uuid(), product_id: p1, url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p1, url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p2, url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p2, url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p3, url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p3, url: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p4, url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p4, url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p5, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p5, url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p6, url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p6, url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p7, url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p7, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p8, url: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p8, url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p9, url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p9, url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p10, url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p10, url: 'https://images.unsplash.com/photo-1589584649628-b405527a08b9?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },

    { id: uuid(), product_id: p11, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    { id: uuid(), product_id: p11, url: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop', sort_order: 1, created_at: nowIso() },
  ];

  const fabricGroup = uuid();
  const widthGroup = uuid();
  const addonsGroup = uuid();
  const seatsGroup = uuid();
  const doorFinishGroup = uuid();
  const chairColorGroup = uuid();

  const option_groups = [
    { id: fabricGroup, product_id: p2, name: 'Fabric', type: 'select', sort_order: 0, step: 1, price_per_unit: 0, created_at: nowIso() },
    { id: widthGroup, product_id: p1, name: 'Width', type: 'numeric', sort_order: 0, min_value: 120, max_value: 220, step: 5, unit_label: 'cm', price_per_unit: 3, created_at: nowIso() },
    { id: addonsGroup, product_id: p2, name: 'Add-ons', type: 'multiselect', sort_order: 1, step: 1, price_per_unit: 0, created_at: nowIso() },
    { id: seatsGroup, product_id: p2, name: 'Seats', type: 'numeric', sort_order: 2, min_value: 2, max_value: 5, step: 1, unit_label: 'seats', price_per_unit: 250, created_at: nowIso() },
    { id: doorFinishGroup, product_id: p6, name: 'Wood Finish', type: 'select', sort_order: 0, created_at: nowIso() },
    { id: chairColorGroup, product_id: p10, name: 'Frame Color', type: 'select', sort_order: 0, created_at: nowIso() },
  ];
  const option_values = [
    { id: uuid(), option_group_id: fabricGroup, label: 'Linen', price_modifier: 0, sort_order: 0, created_at: nowIso() },
    { id: uuid(), option_group_id: fabricGroup, label: 'Velvet', price_modifier: 300, sort_order: 1, created_at: nowIso() },
    { id: uuid(), option_group_id: fabricGroup, label: 'Leather', price_modifier: 550, sort_order: 2, created_at: nowIso() },
    { id: uuid(), option_group_id: addonsGroup, label: 'Extra Cushion', price_modifier: 40, sort_order: 0, created_at: nowIso() },
    { id: uuid(), option_group_id: addonsGroup, label: 'Armrest Tray', price_modifier: 60, sort_order: 1, created_at: nowIso() },
    { id: uuid(), option_group_id: doorFinishGroup, label: 'Natural Matte Oak', price_modifier: 0, sort_order: 0, created_at: nowIso() },
    { id: uuid(), option_group_id: doorFinishGroup, label: 'Dark Smoked Oak', price_modifier: 150, sort_order: 1, created_at: nowIso() },
    { id: uuid(), option_group_id: chairColorGroup, label: 'Midnight Black', price_modifier: 0, sort_order: 0, created_at: nowIso() },
    { id: uuid(), option_group_id: chairColorGroup, label: 'Polished Chrome', price_modifier: 80, sort_order: 1, created_at: nowIso() },
  ];

  const sampleOrder = uuid();
  const orders = [
    { id: sampleOrder, customer_name: 'Sample Customer', phone: '01000000000', status: 'pending', notes: 'This is demo data — delete it any time from the Order Requests tab.', created_at: nowIso() },
  ];
  const order_items = [
    { id: uuid(), order_id: sampleOrder, product_id: p1, quantity: 1, selected_options: [], total_price: 1250, created_at: nowIso() },
  ];

  const db = { categories, products, product_images, option_groups, option_values, orders, order_items, custom_requests: seedCustomRequests() };
  saveDB(db);
  return db;
}

export function switchDemoPreset(presetKey) {
  const cat1 = uuid();
  const cat2 = uuid();
  const cat3 = uuid();
  let categories = [];
  let products = [];
  let product_images = [];
  let option_groups = [];
  let option_values = [];

  if (presetKey === 'carpentry') {
    categories = [
      { id: cat1, name: 'Bespoke Doors', created_at: nowIso() },
      { id: cat2, name: 'Wall Paneling', created_at: nowIso() },
      { id: cat3, name: 'Custom Wardrobes', created_at: nowIso() },
    ];
    const p1 = uuid();
    const p2 = uuid();
    const p3 = uuid();
    products = [
      { id: p1, name: 'Solid Oak Entrance Door', category_id: cat1, price: 1850, price_type: 'fixed', description: 'Handcrafted solid oak door with brass ironmongery and weather sealing.', is_available: true, created_at: nowIso() },
      { id: p2, name: 'Walnut Acoustic Wall Panels', category_id: cat2, price: 240, price_type: 'range', description: 'Natural walnut wood slat acoustic panels for luxury interior accent walls.', is_available: true, created_at: nowIso() },
      { id: p3, name: 'Fitted Master Wardrobe', category_id: cat3, price: null, price_type: 'on_request', description: 'Floor-to-ceiling built-in wardrobe with soft-close drawers and LED strip channels.', is_available: true, created_at: nowIso() },
    ];
    product_images = [
      { id: uuid(), product_id: p1, url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
      { id: uuid(), product_id: p2, url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
      { id: uuid(), product_id: p3, url: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    ];
    const og1 = uuid();
    option_groups = [
      { id: og1, product_id: p1, name: 'Wood Finish', type: 'select', sort_order: 0, created_at: nowIso() },
    ];
    option_values = [
      { id: uuid(), option_group_id: og1, label: 'Natural Matte Oak', price_modifier: 0, sort_order: 0, created_at: nowIso() },
      { id: uuid(), option_group_id: og1, label: 'Dark Smoked Oak', price_modifier: 150, sort_order: 1, created_at: nowIso() },
    ];
  } else if (presetKey === 'executive_office') {
    categories = [
      { id: cat1, name: 'Desks & Workstations', created_at: nowIso() },
      { id: cat2, name: 'Seating', created_at: nowIso() },
      { id: cat3, name: 'Conference', created_at: nowIso() },
    ];
    const p1 = uuid();
    const p2 = uuid();
    const p3 = uuid();
    products = [
      { id: p1, name: 'Executive Mahogany Desk', category_id: cat1, price: 2100, price_type: 'fixed', description: 'Spacious executive desk with integrated cable management and leather inlay.', is_available: true, created_at: nowIso() },
      { id: p2, name: 'Ergonomic Mesh Manager Chair', category_id: cat2, price: 580, price_type: 'fixed', description: 'Full lumbar support with aluminum base and breathable mesh back.', is_available: true, created_at: nowIso() },
      { id: p3, name: '10-Person Conference Table', category_id: cat3, price: 3400, price_type: 'range', description: 'Solid teak top conference table with built-in power hubs.', is_available: true, created_at: nowIso() },
    ];
    product_images = [
      { id: uuid(), product_id: p1, url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
      { id: uuid(), product_id: p2, url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
      { id: uuid(), product_id: p3, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', sort_order: 0, created_at: nowIso() },
    ];
    const og1 = uuid();
    option_groups = [
      { id: og1, product_id: p2, name: 'Frame Color', type: 'select', sort_order: 0, created_at: nowIso() },
    ];
    option_values = [
      { id: uuid(), option_group_id: og1, label: 'Midnight Black', price_modifier: 0, sort_order: 0, created_at: nowIso() },
      { id: uuid(), option_group_id: og1, label: 'Polished Chrome', price_modifier: 80, sort_order: 1, created_at: nowIso() },
    ];
  } else {
    return seedDB();
  }

  const db = {
    categories,
    products,
    product_images,
    option_groups,
    option_values,
    orders: [],
    order_items: [],
    custom_requests: seedCustomRequests()
  };
  saveDB(db);
  localStorage.setItem('DEMO_PRESET_KEY', presetKey);
  return db;
}

function seedCustomRequests() {
  return [
    {
      id: uuid(),
      customer_name: 'Sample Customer',
      phone: '01000000000',
      category: 'Living Room',
      description: 'Looking for a corner sectional similar to the Wraith sofa but wider, in a deep green fabric.',
      dimensions_note: 'Roughly 3m along the long side',
      materials_note: 'Velvet, walnut legs',
      reference_note: 'This is demo data — delete it any time from the Custom Requests tab.',
      status: 'new',
      admin_notes: '',
      created_at: nowIso(),
    },
  ];
}

// --- Persistence ---------------------------------------------------------

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db.categories && db.categories.length >= 8 && db.product_images && db.product_images.length >= 15) return db;
    }
  } catch (err) {
    console.error('Local DB read error, reseeding:', err);
  }
  return seedDB();
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function loadImageStore() {
  try {
    const raw = localStorage.getItem(IMAGE_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Local image store read error:', err);
  }
  return {};
}

function saveImageStore(store) {
  localStorage.setItem(IMAGE_STORE_KEY, JSON.stringify(store));
}

// --- Query helpers ---------------------------------------------------------

function matchesFilters(row, filters) {
  return filters.every((f) => {
    if (f.type === 'eq') return row[f.col] === f.val;
    if (f.type === 'in') return Array.isArray(f.val) && f.val.includes(row[f.col]);
    return true;
  });
}

function parseSelect(str) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of str || '*') {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function cascadeDeleteRow(db, table, row) {
  db[table] = (db[table] || []).filter((r) => r.id !== row.id);
  (CASCADE_DELETE[table] || []).forEach(({ table: childTable, fk }) => {
    const childRows = db[childTable] || [];
    const toCascade = childRows.filter((c) => c[fk] === row.id);
    toCascade.forEach((child) => cascadeDeleteRow(db, childTable, child));
  });
}

function doInsert(db, table, payload) {
  const rows = Array.isArray(payload) ? payload : [payload];
  const defaultsFn = TABLE_DEFAULTS[table];
  const inserted = rows.map((row) => {
    const withDefaults = {
      id: row.id || uuid(),
      created_at: row.created_at || nowIso(),
      ...row,
      ...(defaultsFn ? defaultsFn(row) : {}),
    };
    db[table] = db[table] || [];
    db[table].push(withDefaults);
    return { ...withDefaults };
  });
  return inserted;
}

function doUpdate(db, table, payload, filters) {
  const rows = db[table] || [];
  const matched = rows.filter((r) => matchesFilters(r, filters));
  matched.forEach((r) => Object.assign(r, payload));
  return matched.map((r) => ({ ...r }));
}

function doDelete(db, table, filters) {
  const rows = db[table] || [];
  const matched = rows.filter((r) => matchesFilters(r, filters));
  const matchedIds = new Set(matched.map((r) => r.id));
  db[table] = rows.filter((r) => !matchedIds.has(r.id));

  (CASCADE_DELETE[table] || []).forEach(({ table: childTable, fk }) => {
    matched.forEach((parent) => {
      const childRows = db[childTable] || [];
      const toCascade = childRows.filter((c) => c[fk] === parent.id);
      toCascade.forEach((child) => cascadeDeleteRow(db, childTable, child));
    });
  });

  (SET_NULL_ON_DELETE[table] || []).forEach(({ table: childTable, fk }) => {
    matched.forEach((parent) => {
      (db[childTable] || []).forEach((c) => {
        if (c[fk] === parent.id) c[fk] = null;
      });
    });
  });

  return matched;
}

function doSelect(db, table, filters, order, selectCols) {
  let rows = (db[table] || []).filter((r) => matchesFilters(r, filters));

  if (order) {
    rows = [...rows].sort((a, b) => {
      const av = a[order.col];
      const bv = b[order.col];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return order.ascending ? cmp : -cmp;
    });
  }

  const relationParts = parseSelect(selectCols).filter((p) => p.includes('('));

  return rows.map((row) => {
    const out = { ...row };
    relationParts.forEach((part) => {
      const m = part.match(/^(\w+)\(/);
      if (!m) return;
      const relName = m[1];
      const relDef = (RELATIONS[table] || {})[relName];
      if (!relDef) return;
      const foreignRows = db[relDef.foreignTable] || [];
      if (relDef.type === 'one') {
        const match = foreignRows.find((fr) => fr[relDef.foreignKey] === row[relDef.localKey]);
        out[relName] = match ? { ...match } : null;
      } else {
        out[relName] = foreignRows.filter((fr) => fr[relDef.foreignKey] === row[relDef.localKey]).map((r) => ({ ...r }));
      }
    });
    return out;
  });
}

// --- Query builder (mimics the chainable Supabase JS query API) -----------

class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.op = null;
    this.payload = null;
    this.filters = [];
    this._order = null;
    this._single = false;
    this._selectCols = '*';
  }

  select(cols) {
    if (!this.op) this.op = 'select';
    if (cols) this._selectCols = cols;
    return this;
  }

  insert(payload) {
    this.op = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.op = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(col, val) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  in(col, val) {
    this.filters.push({ type: 'in', col, val });
    return this;
  }

  order(col, opts) {
    this._order = { col, ascending: !opts || opts.ascending !== false };
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  async _execute() {
    try {
      const db = loadDB();
      let data;
      if (this.op === 'insert') data = doInsert(db, this.table, this.payload);
      else if (this.op === 'update') data = doUpdate(db, this.table, this.payload, this.filters);
      else if (this.op === 'delete') data = doDelete(db, this.table, this.filters);
      else data = doSelect(db, this.table, this.filters, this._order, this._selectCols);

      saveDB(db);

      if (this._single) {
        data = Array.isArray(data) && data.length > 0 ? data[0] : null;
      }
      return { data, error: null };
    } catch (err) {
      console.error(`Local backend error on ${this.table}:`, err);
      return { data: null, error: { message: err.message || String(err) } };
    }
  }

  then(onFulfilled, onRejected) {
    return this._execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._execute().catch(onRejected);
  }
}

// --- Storage (mimics supabase.storage.from(bucket).upload/getPublicUrl/remove) ---

function createStorageAPI() {
  return {
    from(bucket) {
      return {
        async upload(path, file) {
          try {
            const dataUrl = await fileToDataURL(file);
            const store = loadImageStore();
            store[`${bucket}/${path}`] = dataUrl;
            saveImageStore(store);
            return { data: { path }, error: null };
          } catch (err) {
            if (err && err.name === 'QuotaExceededError') {
              return { data: null, error: { message: 'Local storage is full. Try a smaller image, remove some existing products, or connect a real Supabase project for production use.' } };
            }
            return { data: null, error: { message: err.message || String(err) } };
          }
        },
        getPublicUrl(path) {
          const store = loadImageStore();
          const url = store[`${bucket}/${path}`] || '';
          return { data: { publicUrl: url } };
        },
        async remove(paths) {
          const store = loadImageStore();
          (paths || []).forEach((p) => delete store[`${bucket}/${p}`]);
          saveImageStore(store);
          return { data: null, error: null };
        },
      };
    },
  };
}

// --- Auth (mimics supabase.auth.signInWithPassword/getSession/signOut) ----

function createAuthAPI() {
  return {
    async getSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return { data: { session: null }, error: null };
        return { data: { session: JSON.parse(raw) }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    async signInWithPassword({ email, password }) {
      const adminEmail = localStorage.getItem(ADMIN_EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;
      const adminPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;

      if ((email || '').trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
        const session = { user: { id: 'local-admin', email: adminEmail }, access_token: 'local-session' };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { data: { session, user: session.user }, error: null };
      }
      return { data: { session: null, user: null }, error: { message: 'Invalid login credentials' } };
    },
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
  };
}

// --- Public factory ---------------------------------------------------------

export function createLocalClient() {
  return {
    auth: createAuthAPI(),
    storage: createStorageAPI(),
    from(table) {
      return new LocalQueryBuilder(table);
    },
  };
}
