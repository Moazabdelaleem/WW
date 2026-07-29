# Changes in this update

Added the customizable order-request flow on top of the existing catalog + admin CRUD.

## New database tables (run supabase/schema_orders_and_options.sql, then policies_orders_and_options.sql)
- option_groups, option_values — customization choices per product (e.g. Fabric, Size)
- orders, order_items — customer order requests (admin-only read, per RLS)

## admin/dashboard.html + js/admin.js
- New "Order Requests" tab: list, filter by status, click into an order to see items/options, update status (pending/confirmed/rejected), add internal notes
- Product edit modal: new "Customization Options" section — add option groups (e.g. "Fabric") and values with a price modifier (e.g. "Velvet +500"). Only available on existing products (save the product first).

## index.html + js/catalog.js
- Product detail modal now shows customization options (if the product has any), with live price recalculation as the customer picks options and changes quantity
- New order request form (name, phone, notes) — submits to `orders` + `order_items`. No payment involved — this is a request, confirmed by phone.

## css/styles.css
- Added .badge-warning (pending status) and styles for option selectors / order form

## What to test before trusting this live
1. Run both new SQL files in the Supabase SQL editor, in order.
2. Log in as admin, edit an existing product, add an option group + a couple of values.
3. On the public site, open that product — confirm the options show up and price updates live as you click them.
4. Submit a test order request as a logged-out visitor.
5. Log in as admin, confirm the order appears under "Order Requests" with the right options/price.
6. IMPORTANT: while logged out, try to query the `orders` table directly (e.g. via the Supabase JS client in the browser console) and confirm it's rejected. This is the one thing that must not be skipped.
