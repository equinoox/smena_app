-- Smena initial schema: profiles, venues, listings, applications, saved_listings.
-- Run in the Supabase SQL editor (or `supabase db push`). RLS lives in 0002_rls.sql.

-- Enums -----------------------------------------------------------------------
create type user_role as enum ('worker', 'venue');
create type venue_type as enum ('cafe', 'bar', 'restaurant', 'club', 'bakery');
create type worker_role as enum (
  'waiter', 'bartender', 'barista', 'cook', 'host', 'kitchen_helper'
);
create type employment_type as enum ('fill_in', 'part_time', 'full_time');
create type pay_period as enum ('hour', 'shift', 'month');
create type listing_status as enum ('open', 'closed', 'filled');
create type application_status as enum (
  'pending', 'accepted', 'rejected', 'withdrawn'
);

-- Shared updated_at trigger ----------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one row per auth user, extends auth.users -------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  full_name text,
  phone text, -- profile data only; NOT the login method (see auth notes)
  avatar_url text,
  bio text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile when a new auth user signs up.
-- Role + name are passed via signUp options.data (user metadata).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'worker'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- venues: a business owned by a profile with role = 'venue' -------------------
-- lat/lng stored now so react-native-maps + geo queries can be added later.
-- To enable radius search later: `create extension postgis;` then add a
-- generated geography column, e.g.
--   location geography(Point, 4326)
--     generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored
create table venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  venue_type venue_type not null,
  description text,
  address text,
  city text,
  lat double precision,
  lng double precision,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venues_owner_id_idx on venues (owner_id);
create index venues_city_idx on venues (city);

create trigger venues_set_updated_at
  before update on venues
  for each row execute function set_updated_at();

-- listings: shift postings created by a venue ---------------------------------
create table listings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  title text not null,
  role_needed worker_role not null,
  employment_type employment_type not null,
  description text,
  pay_amount numeric(10, 2),
  pay_period pay_period not null default 'hour',
  currency text not null default 'RSD',
  starts_at timestamptz,
  ends_at timestamptz,
  is_urgent boolean not null default false,
  status listing_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_venue_id_idx on listings (venue_id);
create index listings_status_idx on listings (status);
create index listings_employment_type_idx on listings (employment_type);
create index listings_created_at_idx on listings (created_at desc);

create trigger listings_set_updated_at
  before update on listings
  for each row execute function set_updated_at();

-- applications: a worker applying to a listing --------------------------------
create table applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  worker_id uuid not null references profiles (id) on delete cascade,
  status application_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, worker_id)
);

create index applications_listing_id_idx on applications (listing_id);
create index applications_worker_id_idx on applications (worker_id);

create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

-- saved_listings: a worker's bookmarks ----------------------------------------
create table saved_listings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (worker_id, listing_id)
);

create index saved_listings_worker_id_idx on saved_listings (worker_id);
