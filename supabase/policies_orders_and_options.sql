-- policies_orders_and_options.sql
-- Run this AFTER schema_orders_and_options.sql.
-- Same pattern as policies.sql: public read on catalog-facing data,
-- authenticated-only for admin actions. Orders are the exception —
-- public can SUBMIT a request but never READ orders (that's customer
-- contact info, admin-only in both directions).

alter table option_groups enable row level security;
alter table option_values enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ---------------------------------------------------------
-- Option Groups — public read (needed to show customization choices),
-- admin-only write
-- ---------------------------------------------------------
create policy "Allow public read access on option_groups"
  on option_groups for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admins to insert option_groups"
  on option_groups for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update option_groups"
  on option_groups for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete option_groups"
  on option_groups for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Option Values — same pattern
-- ---------------------------------------------------------
create policy "Allow public read access on option_values"
  on option_values for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admins to insert option_values"
  on option_values for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update option_values"
  on option_values for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete option_values"
  on option_values for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Orders — NO public read. Anyone can submit (insert) a request,
-- but only the authenticated admin can view, update status, or delete.
-- ---------------------------------------------------------
create policy "Allow public to submit orders"
  on orders for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated admins to read orders"
  on orders for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update orders"
  on orders for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete orders"
  on orders for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Order Items — same pattern as orders: public insert-only,
-- admin-only read/update/delete
-- ---------------------------------------------------------
create policy "Allow public to submit order_items"
  on order_items for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated admins to read order_items"
  on order_items for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update order_items"
  on order_items for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete order_items"
  on order_items for delete
  to authenticated
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- IMPORTANT — test this before relying on it:
-- 1. Log out (or use an incognito window with no admin session).
-- 2. Try to SELECT from `orders` directly via the Supabase JS client
--    using the anon key. It MUST fail / return nothing.
-- 3. Try INSERT into `orders` while logged out. It SHOULD succeed
--    (that's the public order-submission flow working as intended).
-- If step 2 doesn't fail, do not deploy this to a real domain yet.
-- ---------------------------------------------------------
