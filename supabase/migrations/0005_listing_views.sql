-- Tracks each time a worker opens a listing detail (used for venue home dashboard stats).
create table listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  viewer_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index listing_views_listing_id_idx on listing_views (listing_id);
create index listing_views_created_at_idx on listing_views (created_at);

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
