-- schema_orders_and_options.sql
-- Run this AFTER schema.sql. Adds product customization options and the order-request flow.
-- Safe to run once; uses "if not exists" throughout.

-- ---------------------------------------------------------
-- Option groups (e.g. "Fabric", "Size") — belong to a product
-- ---------------------------------------------------------
create table if not exists option_groups (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete cascade not null,
    name text not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- Option values (e.g. "Velvet +500", "3-seater +700") — belong to a group
-- ---------------------------------------------------------
create table if not exists option_values (
    id uuid primary key default gen_random_uuid(),
    option_group_id uuid references option_groups(id) on delete cascade not null,
    label text not null,
    price_modifier numeric(10, 2) default 0 not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- Orders — one row per customer order request
-- No public read access (see policies file) — this is customer contact info.
-- ---------------------------------------------------------
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    phone text not null,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- Order items — one row per product line within an order
-- selected_options stores the chosen option values as jsonb, e.g.
--   [{"group": "Fabric", "value": "Velvet", "price_modifier": 500}, ...]
-- total_price is the calculated price AT THE TIME OF ORDER — stored, not
-- recalculated later, so past orders stay accurate even if prices change after.
-- ---------------------------------------------------------
create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade not null,
    product_id uuid references products(id) on delete set null,
    quantity integer default 1 not null check (quantity > 0),
    selected_options jsonb default '[]'::jsonb,
    total_price numeric(10, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------
-- Helpful indexes for the admin orders view
-- ---------------------------------------------------------
create index if not exists idx_option_groups_product on option_groups(product_id);
create index if not exists idx_option_values_group on option_values(option_group_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_status on orders(status);
