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

  const products = [
    { id: p1, name: 'Oakhurst Dining Table', category_id: catDining, price: 1250, price_type: 'fixed', description: 'Solid oak dining table, hand-finished, seats six comfortably.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p2, name: 'Wraith Lounge Sofa', category_id: catLiving, price: 1800, price_type: 'range', description: 'Three-seater sofa with a solid pine frame. Choose your own fabric.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p3, name: 'Solene Platform Bed', category_id: catBedroom, price: 950, price_type: 'fixed', description: 'Low-profile platform bed frame in walnut veneer, queen size.', is_available: false, is_featured: false, created_at: new Date().toISOString() },
    { id: p4, name: 'Custom Teak Bench', category_id: catOutdoor, price: null, price_type: 'on_request', description: 'Weather-treated teak bench, built to your dimensions.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p5, name: 'Aria Accent Chair', category_id: catLiving, price: 620, price_type: 'fixed', description: 'Compact accent chair with brass legs and a curved backrest.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p6, name: 'Solid Oak Entrance Door', category_id: catDoors, price: 1850, price_type: 'fixed', description: 'Handcrafted solid oak door with brass ironmongery and weather sealing.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p7, name: 'Walnut Acoustic Wall Panels', category_id: catWall, price: 240, price_type: 'range', description: 'Natural walnut wood slat acoustic panels for luxury interior accent walls.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p8, name: 'Fitted Master Wardrobe', category_id: catWardrobes, price: null, price_type: 'on_request', description: 'Floor-to-ceiling built-in wardrobe with soft-close drawers and LED strip channels.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p9, name: 'Executive Mahogany Desk', category_id: catDesks, price: 2100, price_type: 'fixed', description: 'Spacious executive desk with integrated cable management and leather inlay.', is_available: true, is_featured: true, created_at: new Date().toISOString() },
    { id: p10, name: 'Ergonomic Mesh Manager Chair', category_id: catSeating, price: 580, price_type: 'fixed', description: 'Full lumbar support with aluminum base and breathable mesh back.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
    { id: p11, name: '10-Person Conference Table', category_id: catConference, price: 3400, price_type: 'range', description: 'Solid teak top conference table with built-in power hubs.', is_available: true, is_featured: false, created_at: new Date().toISOString() },
  ];

  const product_images = [
    { id: 'img-1-1', product_id: p1, url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-1-2', product_id: p1, url: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-2-1', product_id: p2, url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-2-2', product_id: p2, url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-3-1', product_id: p3, url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-3-2', product_id: p3, url: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-4-1', product_id: p4, url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-4-2', product_id: p4, url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-5-1', product_id: p5, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-5-2', product_id: p5, url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-6-1', product_id: p6, url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-6-2', product_id: p6, url: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-7-1', product_id: p7, url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-7-2', product_id: p7, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-8-1', product_id: p8, url: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-8-2', product_id: p8, url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-9-1', product_id: p9, url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-9-2', product_id: p9, url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-10-1', product_id: p10, url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-10-2', product_id: p10, url: 'https://images.unsplash.com/photo-1589584649628-b405527a08b9?q=80&w=800&auto=format&fit=crop', sort_order: 1 },

    { id: 'img-11-1', product_id: p11, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', sort_order: 0 },
    { id: 'img-11-2', product_id: p11, url: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop', sort_order: 1 },
  ];

  const option_groups = [
    { id: 'og-fabric', product_id: p2, name: 'Fabric', type: 'select', sort_order: 0 },
    { id: 'og-wood', product_id: p1, name: 'Wood Finish', type: 'radio', sort_order: 0 },
    { id: 'og-width', product_id: p4, name: 'Width', type: 'numeric', min_value: 120, max_value: 240, step: 10, unit_label: 'cm', price_per_unit: 4, sort_order: 0 }
  ];

  const option_values = [
    { id: 'ov-f1', option_group_id: 'og-fabric', name: 'Linen', price_modifier: 0 },
    { id: 'ov-f2', option_group_id: 'og-fabric', name: 'Velvet', price_modifier: 120 },
    { id: 'ov-f3', option_group_id: 'og-fabric', name: 'Leather', price_modifier: 350 },
    { id: 'ov-w1', option_group_id: 'og-wood', name: 'Natural Matte Oak', price_modifier: 0 },
    { id: 'ov-w2', option_group_id: 'og-wood', name: 'Dark Smoked Oak', price_modifier: 90 }
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
