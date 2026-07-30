import { createClient } from '@supabase/supabase-js';
import { generateSeedData } from './src/data/mockData.js';

const url = 'https://jmujgwktrjaotkbzbdpb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdWpnd2t0cmphb3RrYnpiZHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzg3MDAsImV4cCI6MjEwMDY1NDcwMH0.vSvwgZl1knLOwLSjKoDivWe173WUIVnlGUwiSwK7YBE';

const supabase = createClient(url, key);

async function seed() {
  console.log('🚀 Seeding live Supabase database at https://jmujgwktrjaotkbzbdpb.supabase.co ...');
  const data = generateSeedData();

  // 1. Seed Categories
  const { error: catErr } = await supabase.from('categories').upsert(data.categories, { onConflict: 'id' });
  if (catErr) console.log('❌ Categories seed error:', catErr.message);
  else console.log('✅ Categories seeded successfully!');

  // 2. Seed Products
  const { error: prodErr } = await supabase.from('products').upsert(data.products, { onConflict: 'id' });
  if (prodErr) console.log('❌ Products seed error:', prodErr.message);
  else console.log('✅ Products seeded successfully!');

  // 3. Seed Product Images
  const { error: imgErr } = await supabase.from('product_images').upsert(data.product_images, { onConflict: 'id' });
  if (imgErr) console.log('❌ Product Images seed error:', imgErr.message);
  else console.log('✅ Product Images seeded successfully!');

  // 4. Seed Option Groups & Values
  const { error: ogErr } = await supabase.from('option_groups').upsert(data.option_groups, { onConflict: 'id' });
  if (ogErr) console.log('❌ Option Groups seed error:', ogErr.message);
  else console.log('✅ Option Groups seeded successfully!');

  const { error: ovErr } = await supabase.from('option_values').upsert(data.option_values, { onConflict: 'id' });
  if (ovErr) console.log('❌ Option Values seed error:', ovErr.message);
  else console.log('✅ Option Values seeded successfully!');

  console.log('\n🎉 Live Supabase Database Population Complete!');
}

seed();
