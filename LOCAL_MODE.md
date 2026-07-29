# Local demo mode

The app now works with **zero backend setup**. If no real Supabase project is
configured, `js/supabaseClient.js` automatically falls back to
`js/localBackend.js`, a small mock of the Supabase client backed by
`localStorage`. Everything — catalog browsing, search/filters, the admin
CRUD, image upload, order requests, product customization options — works
exactly as before, because `catalog.js` / `admin.js` / `auth.js` were left
untouched: they just call `getSupabaseClient()` and don't know or care
whether it's the real thing or the local one.

## What you get out of the box

- Open `index.html` directly (or serve the folder) — a seeded demo catalog
  (5 products, 4 categories, one product with "Fabric" options, one sample
  order) is created automatically the first time.
- Admin login at `/admin/login.html`:
  - **Email:** `admin@local.test`
  - **Password:** `admin123`
  - Shown on the login page itself whenever local mode is active.
- Add/edit/delete products and categories, upload images (stored as base64
  in `localStorage` — fine for a handful of demo images, not for production
  volume), manage order requests — all of it works.

## The one thing this is NOT

**`localStorage` is per-browser, per-device.** It is not a shared database.

That means:
- If you deploy this to GitHub Pages (or anywhere) while still in local
  mode, every visitor gets their **own empty catalog** — they won't see the
  products you added, because your admin edits only ever wrote to *your*
  browser's storage.
- Editing on your laptop and checking on your phone will show two different
  catalogs.
- This mode is for building and testing on one machine, not for taking
  orders from real customers.

**Before this goes live for real customers**, connect a real Supabase
project: go to `/admin/login.html` → "Configure Database Connection" (or the
same modal on `index.html`), or hardcode `PROD_SUPABASE_URL` /
`PROD_SUPABASE_ANON_KEY` in `js/supabaseClient.js`. Everything you built in
local mode won't carry over automatically — see "Moving from local mode to
real Supabase" below.

## Switching to real Supabase later

1. Follow the "Setup steps" in `README.md` (create project, run
   `supabase/schema.sql` + `supabase/policies.sql`, then
   `supabase/schema_orders_and_options.sql` + `policies_orders_and_options.sql`).
2. Enter the project URL + anon key via "Configure Database Connection".
3. The app now talks to real Supabase — local demo data stays in
   `localStorage` untouched but is no longer used. There's no automatic
   migration; re-enter your real products through the admin panel (or write
   a one-off script against `supabase/schema.sql` if you want to port the
   seeded/edited local data).
4. To go back to local mode at any point, click "Disconnect DB" in the admin
   header (clears the saved Supabase credentials).

## Changing the local admin credentials

There's no UI for this yet. From the browser console on the site:

```js
localStorage.setItem('LOCAL_ADMIN_EMAIL', 'you@example.com');
localStorage.setItem('LOCAL_ADMIN_PASSWORD', 'your-password');
```

## Resetting local demo data

```js
localStorage.removeItem('LOCAL_DB_V1');
localStorage.removeItem('LOCAL_IMAGE_STORE_V1');
```
Then reload — a fresh seeded catalog is generated.
