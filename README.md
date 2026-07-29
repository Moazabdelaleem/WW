# Furniture Catalog + Admin CMS

A searchable digital catalog for a furniture workshop, with a login-gated admin panel
to manage products without touching code.

## Stack

- **Frontend:** Static HTML/CSS/JS (or React — your call), hosted on GitHub Pages
- **Backend:** Supabase (Postgres + Auth + Storage) — free tier
- **Auth:** Supabase Auth, single admin account, no public signup

## Architecture

```
Public visitor → GitHub Pages (static site) → reads Supabase (public, read-only)
Admin (owner)  → /admin login page → Supabase Auth → writes to Supabase (RLS-protected)
```

One codebase serves two views: the public catalog and the admin panel. Both talk to
the same Supabase project. The public `anon` key is safe to expose client-side —
Row Level Security (RLS) is what actually enforces who can read vs. write, not the key.

**Never expose the `service_role` key in frontend code.** It bypasses RLS entirely.

## File structure

```
catalog/
├── README.md
├── .env.example              # Supabase URL + anon key (never commit real .env)
├── index.html                # public catalog page
├── admin/
│   ├── login.html
│   └── dashboard.html        # add/edit/delete products, upload images
├── css/
│   └── styles.css
├── js/
│   ├── supabaseClient.js     # Supabase init, shared by public + admin
│   ├── catalog.js            # fetch + render products, search/filter logic
│   ├── auth.js                # login/logout, session check
│   └── admin.js               # CRUD form handlers, image upload
├── images/
│   └── (placeholder/demo images only — real images live in Supabase Storage)
└── supabase/
    ├── schema.sql             # table definitions
    └── policies.sql           # RLS policies
```

## Database schema

```sql
categories
  id            uuid primary key default gen_random_uuid()
  name          text not null
  created_at    timestamptz default now()

products
  id            uuid primary key default gen_random_uuid()
  name          text not null
  category_id   uuid references categories(id)
  price         numeric
  price_type    text check (price_type in ('fixed', 'range', 'on_request'))
  description   text
  is_available  boolean default true
  created_at    timestamptz default now()

product_images
  id            uuid primary key default gen_random_uuid()
  product_id    uuid references products(id) on delete cascade
  url           text not null
  sort_order    int default 0
```

## RLS policies (summary — see supabase/policies.sql for actual SQL)

- `categories`, `products`, `product_images`: **public SELECT**, allowed for anyone
- `categories`, `products`, `product_images`: **INSERT/UPDATE/DELETE** restricted to
  `auth.role() = 'authenticated'`
- Storage bucket `product-images`: public read, authenticated-only upload/delete

## Setup steps

1. Create a Supabase project (free tier)
2. Run `supabase/schema.sql` in the SQL editor
3. Run `supabase/policies.sql` to enable RLS
4. Create a Storage bucket named `product-images`, set public read access
5. Create one admin user manually via Supabase Auth dashboard (no public signup page)
6. Copy your Supabase project URL + anon key into `js/supabaseClient.js`
7. Push to GitHub, enable GitHub Pages (Settings → Pages → deploy from branch)
8. Log in at `/admin/login.html`, confirm you can add a product
9. Log out, confirm `/admin/dashboard.html` blocks unauthenticated access
10. (Optional) Point a custom domain at GitHub Pages

## What's deliberately NOT in scope (v1)

- Staff logins / multiple roles
- Multiple branches
- Online ordering / checkout / payment
- Server-side search (client-side filtering is enough at 30-100 products)

These are all additive later — the schema leaves room (e.g. adding a `branch_id`
or `role` column doesn't require a redesign), but none of it gets built until
there's an actual need for it.

## Adding a product (for the non-technical admin)

1. Go to `/admin/login.html`, log in
2. Click "Add product"
3. Fill in name, category, price (or mark "on request"), description
4. Upload photo(s)
5. Save — it appears on the public catalog immediately, no redeploy needed
