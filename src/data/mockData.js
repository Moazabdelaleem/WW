export function generateSeedData() {
  const catLiving = 'cat-living-room';
  const catDining = 'cat-dining-room';
  const catBedroom = 'cat-bedroom';
  const catOutdoor = 'cat-outdoor';
  const catDoors = 'cat-bespoke-doors';
  const catWall = 'cat-wall-paneling';
  const catWardrobes = 'cat-custom-wardrobes';
  const catDesks = 'cat-desks-workstations';
  const catSeating = 'cat-seating';
  const catConference = 'cat-conference';

  const categories = [
    { id: catLiving, name: 'Living Room', created_at: new Date().toISOString() },
    { id: catDining, name: 'Dining Room', created_at: new Date().toISOString() },
    { id: catBedroom, name: 'Bedroom', created_at: new Date().toISOString() },
    { id: catOutdoor, name: 'Outdoor', created_at: new Date().toISOString() },
    { id: catDoors, name: 'Bespoke Doors', created_at: new Date().toISOString() },
    { id: catWall, name: 'Wall Paneling', created_at: new Date().toISOString() },
    { id: catWardrobes, name: 'Custom Wardrobes', created_at: new Date().toISOString() },
    { id: catDesks, name: 'Desks & Workstations', created_at: new Date().toISOString() },
    { id: catSeating, name: 'Seating', created_at: new Date().toISOString() },
    { id: catConference, name: 'Conference', created_at: new Date().toISOString() },
  ];

  const p1 = 'prod-1';
  const p2 = 'prod-2';
  const p3 = 'prod-3';
  const p4 = 'prod-4';
  const p5 = 'prod-5';
  const p6 = 'prod-6';
  const p7 = 'prod-7';
  const p8 = 'prod-8';
  const p9 = 'prod-9';
  const p10 = 'prod-10';
  const p11 = 'prod-11';

  // Realistic Egyptian Market Prices (in EGP / L.E.)
  const products = [
    { id: p1, name: 'Oakhurst Dining Table', category_id: catDining, price: 38500, price_type: 'fixed', description: 'Solid oak dining table, hand-finished, seats six comfortably.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p2, name: 'Wraith Lounge Sofa', category_id: catLiving, price: 28000, price_type: 'range', description: 'Three-seater sofa with a solid pine frame. Choose your own fabric.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p3, name: 'Solene Platform Bed', category_id: catBedroom, price: 32000, price_type: 'fixed', description: 'Low-profile platform bed frame in walnut veneer, queen size.', is_available: false, is_featured: false, created_at: new Date().toISOString() },
    { id: p4, name: 'Custom Teak Bench', category_id: catOutdoor, price: 14500, price_type: 'range', description: 'Weather-treated teak bench, built to your dimensions.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p5, name: 'Aria Accent Chair', category_id: catLiving, price: 11200, price_type: 'fixed', description: 'Compact accent chair with brass legs and a curved backrest.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p6, name: 'Solid Oak Entrance Door', category_id: catDoors, price: 24000, price_type: 'fixed', description: 'Handcrafted solid oak door with brass ironmongery and weather sealing.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p7, name: 'Walnut Acoustic Wall Panels', category_id: catWall, price: 4800, price_type: 'range', description: 'Natural walnut wood slat acoustic panels for luxury interior accent walls.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p8, name: 'Fitted Master Wardrobe', category_id: catWardrobes, price: null, price_type: 'on_request', description: 'Floor-to-ceiling built-in wardrobe with soft-close drawers and LED strip channels.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p9, name: 'Executive Mahogany Desk', category_id: catDesks, price: 42000, price_type: 'fixed', description: 'Spacious executive desk with integrated cable management and leather inlay.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p10, name: 'Ergonomic Mesh Manager Chair', category_id: catSeating, price: 8500, price_type: 'fixed', description: 'Full lumbar support with aluminum base and breathable mesh back.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p11, name: '10-Person Conference Table', category_id: catConference, price: 68000, price_type: 'range', description: 'Solid teak top conference table with built-in power hubs.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
  ];

  // Exactly 1 Bespoke AI Generated Product Image Per Item
  const product_images = [
    { id: 'img-1', product_id: p1, url: './images/p1.png', sort_order: 0 },
    { id: 'img-2', product_id: p2, url: './images/p2.png', sort_order: 0 },
    { id: 'img-3', product_id: p3, url: './images/p3.png', sort_order: 0 },
    { id: 'img-4', product_id: p4, url: './images/p4.png', sort_order: 0 },
    { id: 'img-5', product_id: p5, url: './images/p5.png', sort_order: 0 },
    { id: 'img-6', product_id: p6, url: './images/p6.png', sort_order: 0 },
    { id: 'img-7', product_id: p7, url: './images/p7.png', sort_order: 0 },
    { id: 'img-8', product_id: p8, url: './images/p8.png', sort_order: 0 },
    { id: 'img-9', product_id: p9, url: './images/p9.png', sort_order: 0 },
    { id: 'img-10', product_id: p10, url: './images/p10.png', sort_order: 0 },
    { id: 'img-11', product_id: p11, url: './images/p11.png', sort_order: 0 },
  ];

  const option_groups = [
    { id: 'og-fabric', product_id: p2, name: 'Fabric', type: 'select', sort_order: 0 },
    { id: 'og-wood', product_id: p1, name: 'Wood Finish', type: 'radio', sort_order: 0 },
    { id: 'og-width', product_id: p4, name: 'Width', type: 'numeric', min_value: 120, max_value: 240, step: 10, unit_label: 'cm', price_per_unit: 80, sort_order: 0 }
  ];

  const option_values = [
    { id: 'ov-f1', option_group_id: 'og-fabric', name: 'Linen', price_modifier: 0 },
    { id: 'ov-f2', option_group_id: 'og-fabric', name: 'Velvet', price_modifier: 2500 },
    { id: 'ov-f3', option_group_id: 'og-fabric', name: 'Leather', price_modifier: 6000 },
    { id: 'ov-w1', option_group_id: 'og-wood', name: 'Natural Matte Oak', price_modifier: 0 },
    { id: 'ov-w2', option_group_id: 'og-wood', name: 'Dark Smoked Oak', price_modifier: 1800 }
  ];

  return {
    categories,
    products,
    product_images,
    option_groups,
    option_values,
    orders: [],
    custom_requests: []
  };
}
