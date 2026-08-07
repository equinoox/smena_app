-- Multi-venue + venue-less listings: a venue owner may run more than one venue
-- (venues.owner_id already had no unique constraint, so that part needs no schema
-- change) and may post a listing that isn't tied to any venue at all — a one-off
-- temp-job ad. Ownership of a listing moves from "derived via venue_id -> venues.owner_id"
-- to a direct owner_id column, since a venue-less listing has no venue to derive it from.

alter table listings add column owner_id uuid references profiles (id) on delete cascade;

update listings l set owner_id = v.owner_id
from venues v
where v.id = l.venue_id;

alter table listings alter column owner_id set not null;
create index listings_owner_id_idx on listings (owner_id);

-- A listing can now exist without a venue.
alter table listings alter column venue_id drop not null;

-- One-off location for venue-less listings only — venue-backed listings keep using
-- the venue's own address/city/lat/lng, unchanged.
alter table listings add column address text;
alter table listings add column city text;
alter table listings add column lat double precision;
alter table listings add column lng double precision;

-- A permanent role implies a real place of work.
alter table listings add constraint listings_temp_no_fulltime
  check (venue_id is not null or employment_type <> 'full_time');

-- RLS: now that every listing carries its own owner_id, the insert/update/delete
-- policies no longer need to join through venues to find the owner.
drop policy "venue owners can insert listings" on listings;
drop policy "venue owners can update their listings" on listings;
drop policy "venue owners can delete their listings" on listings;

create policy "owners can insert their listings"
  on listings for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owners can update their listings"
  on listings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their listings"
  on listings for delete
  to authenticated
  using (owner_id = auth.uid());

-- Same reasoning for applications/listing_views: their "venue owner can read/update"
-- policies joined listings -> venues to find the owner, which only worked because every
-- listing had a venue. Point them at listings.owner_id directly so they also cover
-- applications/views on venue-less listings.
drop policy "venue owners can read applications to their listings" on applications;
drop policy "venue owners can update applications to their listings" on applications;

create policy "owners can read applications to their listings"
  on applications for select
  to authenticated
  using (
    exists (
      select 1 from listings
      where listings.id = applications.listing_id
        and listings.owner_id = auth.uid()
    )
  );

create policy "owners can update applications to their listings"
  on applications for update
  to authenticated
  using (
    exists (
      select 1 from listings
      where listings.id = applications.listing_id
        and listings.owner_id = auth.uid()
    )
  );

drop policy "venue owners can read views on their listings" on listing_views;

create policy "owners can read views on their listings"
  on listing_views for select
  to authenticated
  using (
    exists (
      select 1 from listings
      where listings.id = listing_views.listing_id
        and listings.owner_id = auth.uid()
    )
  );
