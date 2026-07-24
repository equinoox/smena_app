-- Row Level Security for Smena. Enable RLS + ownership/role-scoped policies.
-- These are sensible starting policies; tighten as features harden.

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

-- saved_listings --------------------------------------------------------------
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
