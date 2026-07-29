-- policies_customization.sql
-- Run this AFTER schema_customization.sql.
-- option_groups already has RLS + policies from policies_orders_and_options.sql
-- covering the new columns automatically (policies are per-row, not per-column),
-- so nothing new is needed there. Only custom_requests needs policies.

alter table custom_requests enable row level security;

-- Same pattern as orders: public can submit, only the authenticated admin
-- can read, update (status/notes), or delete.
create policy "Allow public to submit custom_requests"
  on custom_requests for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated admins to read custom_requests"
  on custom_requests for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "Allow authenticated admins to update custom_requests"
  on custom_requests for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admins to delete custom_requests"
  on custom_requests for delete
  to authenticated
  using (auth.role() = 'authenticated');
