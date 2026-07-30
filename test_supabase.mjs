import { createClient } from '@supabase/supabase-js';

const url = 'https://jmujgwktrjaotkbzbdpb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdWpnd2t0cmphb3RrYnpiZHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzg3MDAsImV4cCI6MjEwMDY1NDcwMH0.vSvwgZl1knLOwLSjKoDivWe173WUIVnlGUwiSwK7YBE';

const supabase = createClient(url, key);

async function run() {
  console.log('🔍 Testing connection to Supabase project...');
  
  const tables = ['categories', 'products', 'product_images', 'option_groups', 'option_values', 'orders', 'custom_requests'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(5);
    if (error) {
      console.log(`❌ Table "${t}": Error (${error.message})`);
    } else {
      console.log(`✅ Table "${t}": OK (${data.length} rows found)`);
    }
  }
}

run();
