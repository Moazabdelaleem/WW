-- schema.sql
-- Run this in your Supabase SQL editor to create the tables.

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create categories table
create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category_id uuid references categories(id) on delete set null,
    price numeric(10, 2),
    price_type text not null check (price_type in ('fixed', 'range', 'on_request')),
    description text,
    is_available boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_images table
create table if not exists product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete cascade not null,
    url text not null,
    sort_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
