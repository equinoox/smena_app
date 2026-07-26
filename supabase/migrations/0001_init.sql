-- Smena v1 schema: profiles, venues, listings, applications, saved_listings,
-- listing_views, storage buckets, and RLS policies.
-- This is the consolidated first migration (supersedes the old 0001-0010 series,
-- squashed before any real users existed). Run in the Supabase SQL editor or
-- via `supabase db push`. Future schema changes are new migrations on top of this.

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
create type experience_level as enum ('none', '1_3_years', '3plus_years');

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
  worker_roles worker_role[] not null default '{}', -- multi-select "which positions" (workers)
  experience_level experience_level,
  skills text[] not null default '{}', -- free-form tags (workers)
  is_available boolean not null default true, -- worker's own "available for shifts" toggle
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
  cover_photo_url text,
  pib text, -- tax id, collected on venue sign-up
  phone text, -- venue's public contact phone (separate from owner's profiles.phone)
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
  requirements text[] not null default '{}', -- free-form tags, e.g. "Iskustvo sa šankom"
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

-- listing_views: tracks each time a worker opens a listing detail -------------
-- (used for venue home dashboard stats).
create table listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  viewer_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index listing_views_listing_id_idx on listing_views (listing_id);
create index listing_views_created_at_idx on listing_views (created_at);

-- Row Level Security ============================================================
-- Sensible starting policies; tighten as features harden.

-- profiles --------------------------------------------------------------------
alter table profiles enable row level security;

-- Profiles are semi-public within the app (workers see venues, venues see workers).
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- venues ----------------------------------------------------------------------
alter table venues enable row level security;

create policy "venues are readable by authenticated users"
  on venues for select
  to authenticated
  using (true);

create policy "owners can insert their venue"
  on venues for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owners can update their venue"
  on venues for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their venue"
  on venues for delete
  to authenticated
  using (owner_id = auth.uid());

-- listings --------------------------------------------------------------------
alter table listings enable row level security;

create policy "listings are readable by authenticated users"
  on listings for select
  to authenticated
  using (true);

create policy "venue owners can insert listings"
  on listings for insert
  to authenticated
  with check (
    exists (
      select 1 from venues
      where venues.id = listings.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue owners can update their listings"
  on listings for update
  to authenticated
  using (
    exists (
      select 1 from venues
      where venues.id = listings.venue_id
        and venues.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from venues
      where venues.id = listings.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue owners can delete their listings"
  on listings for delete
  to authenticated
  using (
    exists (
      select 1 from venues
      where venues.id = listings.venue_id
        and venues.owner_id = auth.uid()
    )
  );

-- applications ----------------------------------------------------------------
alter table applications enable row level security;

-- Workers see their own applications.
create policy "workers can read their applications"
  on applications for select
  to authenticated
  using (worker_id = auth.uid());

-- Venue owners see applications to their listings.
create policy "venue owners can read applications to their listings"
  on applications for select
  to authenticated
  using (
    exists (
      select 1 from listings
      join venues on venues.id = listings.venue_id
      where listings.id = applications.listing_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "workers can apply"
  on applications for insert
  to authenticated
  with check (worker_id = auth.uid());

-- Workers can update their own application (e.g. withdraw).
create policy "workers can update their application"
  on applications for update
  to authenticated
  using (worker_id = auth.uid())
  with check (worker_id = auth.uid());

-- Venue owners can update application status (accept/reject) on their listings.
create policy "venue owners can update applications to their listings"
  on applications for update
  to authenticated
  using (
    exists (
      select 1 from listings
      join venues on venues.id = listings.venue_id
      where listings.id = applications.listing_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "workers can delete their application"
  on applications for delete
  to authenticated
  using (worker_id = auth.uid());

-- saved_listings ----------------------------------------------------------------
alter table saved_listings enable row level security;

create policy "workers can read their saved listings"
  on saved_listings for select
  to authenticated
  using (worker_id = auth.uid());

create policy "workers can save listings"
  on saved_listings for insert
  to authenticated
  with check (worker_id = auth.uid());

create policy "workers can unsave listings"
  on saved_listings for delete
  to authenticated
  using (worker_id = auth.uid());

-- listing_views -----------------------------------------------------------------
alter table listing_views enable row level security;

create policy "workers can log a view"
  on listing_views for insert
  to authenticated
  with check (viewer_id = auth.uid());

create policy "venue owners can read views on their listings"
  on listing_views for select
  to authenticated
  using (
    exists (
      select 1 from listings
      join venues on venues.id = listings.venue_id
      where listings.id = listing_views.listing_id
        and venues.owner_id = auth.uid()
    )
  );

-- Storage =========================================================================
-- Buckets for profile avatars and venue logos (public read, owner write).
-- Files are stored under a top-level folder equal to the user's id: `<uid>/<file>`.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('venue-logos', 'venue-logos', true)
on conflict (id) do nothing;

-- Public read for both buckets.
create policy "public read of avatars and logos"
  on storage.objects for select
  to public
  using (bucket_id in ('avatars', 'venue-logos'));

-- Authenticated users can manage only files inside their own id folder.
create policy "users manage their own avatar files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own avatar files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own avatar files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
