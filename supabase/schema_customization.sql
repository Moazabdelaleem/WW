-- schema_customization.sql
-- Run this AFTER schema_orders_and_options.sql. Safe to run once; uses
-- "if not exists" / "add column if not exists" throughout.
--
-- Adds:
--   1. A `type` to option_groups (select / multiselect / numeric), plus the
--      extra numeric-only fields a "slider" or "stepper" group needs.
--   2. A `custom_requests` table for the "Make Your Own" flow — these are
--      always manually quoted (no price column), reviewed in a separate
--      admin tab from priced orders.

-- ---------------------------------------------------------
-- Option groups — add a type + numeric-range fields
-- ---------------------------------------------------------
alter table option_groups add column if not exists type text not null default 'select'
  check (type in ('select', 'multiselect', 'numeric'));

-- Only used when type = 'numeric'. min_value doubles as the "baseline" —
-- the price only increases for the amount past min_value, times price_per_unit.
alter table option_groups add column if not exists min_value numeric(10, 2);
alter table option_groups add column if not exists max_value numeric(10, 2);
alter table option_groups add column if not exists step numeric(10, 2) default 1;
alter table option_groups add column if not exists unit_label text;
alter table option_groups add column if not exists price_per_unit numeric(10, 2) default 0;

-- ---------------------------------------------------------
-- Custom Requests — "Make Your Own" submissions. No price field on
-- purpose: these are always manually quoted, never auto-priced.
-- No public read access (same reasoning as `orders` — this is customer
-- contact info).
-- ---------------------------------------------------------
create table if not exists custom_requests (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    phone text not null,
    category text,
    description text not null,
    dimensions_note text,
    materials_note text,
    reference_note text,
    status text not null default 'new' check (status in ('new', 'in_review', 'quoted', 'closed')),
    admin_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_custom_requests_status on custom_requests(status);
