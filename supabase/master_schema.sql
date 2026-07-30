-- =========================================================================
-- ArtisanWood Master Supabase Schema & RLS Migration
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and click RUN.
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Categories Table
create table if not exists public.categories (
    id text primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products Table
create table if not exists public.products (
    id text primary key,
    name text not null,
    category_id text references public.categories(id) on delete set null,
    price numeric(10, 2),
    price_type text not null check (price_type in ('fixed', 'range', 'on_request')),
    description text,
    is_available boolean default true not null,
    is_featured boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure missing columns exist if table was created previously
alter table public.products add column if not exists is_featured boolean default false not null;

-- 3. Product Images Table
create table if not exists public.product_images (
    id text primary key,
    product_id text references public.products(id) on delete cascade not null,
    url text not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Option Groups Table
create table if not exists public.option_groups (
    id text primary key,
    product_id text references public.products(id) on delete cascade not null,
    name text not null,
    type text default 'select',
    min_value numeric(10, 2),
    max_value numeric(10, 2),
    step numeric(10, 2),
    unit_label text,
    price_per_unit numeric(10, 2),
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure missing columns exist on option_groups
alter table public.option_groups add column if not exists type text default 'select';
alter table public.option_groups add column if not exists min_value numeric(10, 2);
alter table public.option_groups add column if not exists max_value numeric(10, 2);
alter table public.option_groups add column if not exists step numeric(10, 2);
alter table public.option_groups add column if not exists unit_label text;
alter table public.option_groups add column if not exists price_per_unit numeric(10, 2);

-- 5. Option Values Table
create table if not exists public.option_values (
    id text primary key,
    option_group_id text references public.option_groups(id) on delete cascade not null,
    name text,
    label text,
    price_modifier numeric(10, 2) default 0 not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.option_values add column if not exists name text;
alter table public.option_values add column if not exists label text;

-- 6. Customer Web Orders Table
create table if not exists public.orders (
    id text primary key,
    customer_name text not null,
    phone text not null,
    status text not null default 'pending',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Order Items Table
create table if not exists public.order_items (
    id text primary key,
    order_id text references public.orders(id) on delete cascade not null,
    product_id text references public.products(id) on delete set null,
    quantity integer default 1 not null,
    selected_options jsonb default '[]'::jsonb,
    total_price numeric(10, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Custom Photo/Design Requests Table
create table if not exists public.custom_requests (
    id text primary key,
    customer_name text not null,
    phone text not null,
    description text not null,
    dimensions_note text,
    materials_note text,
    reference_image_url text,
    status text not null default 'new',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- Enable Row Level Security (RLS) & Public Policies
-- =========================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.option_groups enable row level security;
alter table public.option_values enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_requests enable row level security;

-- Public Read & Insert Access
create policy "Public Read Categories" on public.categories for select using (true);
create policy "Public Write Categories" on public.categories for all using (true);

create policy "Public Read Products" on public.products for select using (true);
create policy "Public Write Products" on public.products for all using (true);

create policy "Public Read Product Images" on public.product_images for select using (true);
create policy "Public Write Product Images" on public.product_images for all using (true);

create policy "Public Read Option Groups" on public.option_groups for select using (true);
create policy "Public Write Option Groups" on public.option_groups for all using (true);

create policy "Public Read Option Values" on public.option_values for select using (true);
create policy "Public Write Option Values" on public.option_values for all using (true);

create policy "Public Write Orders" on public.orders for all using (true);
create policy "Public Write Order Items" on public.order_items for all using (true);
create policy "Public Write Custom Requests" on public.custom_requests for all using (true);
