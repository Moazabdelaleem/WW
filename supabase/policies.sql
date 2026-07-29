-- policies.sql
-- Run this in your Supabase SQL editor to set up Row Level Security (RLS) policies.

-- ---------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;

-- ---------------------------------------------------------
-- Categories Table Policies
-- ---------------------------------------------------------
create policy "Allow public read access on categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admins to insert categories"
  on categories for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update categories"
  on categories for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete categories"
  on categories for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Products Table Policies
-- ---------------------------------------------------------
create policy "Allow public read access on products"
  on products for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admins to insert products"
  on products for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update products"
  on products for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete products"
  on products for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Product Images Table Policies
-- ---------------------------------------------------------
create policy "Allow public read access on product_images"
  on product_images for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admins to insert product_images"
  on product_images for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update product_images"
  on product_images for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete product_images"
  on product_images for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Storage Bucket (product-images) Policies
-- ---------------------------------------------------------
-- Note: Create the bucket named 'product-images' in your Supabase storage dashboard first.
-- Make sure the bucket is configured to be public.

-- 1. Allow public select access to images
create policy "Allow public read access to product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- 2. Allow authenticated users to upload images
create policy "Allow authenticated admins to upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 3. Allow authenticated admins to update images
create policy "Allow authenticated admins to update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 4. Allow authenticated admins to delete images
create policy "Allow authenticated admins to delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');
