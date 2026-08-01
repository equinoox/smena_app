-- Adds map-picked location data to profiles (worker home address), mirroring the
-- address/lat/lng columns venues already have. `city` already existed and is kept —
-- it's now populated by reverse-geocoding instead of manual text entry.
alter table profiles
  add column address text,
  add column lat double precision,
  add column lng double precision;

create index profiles_city_idx on profiles (city);

-- No RLS changes needed: the existing "users can update their own profile" policy
-- (id = auth.uid()) is row-scoped and already covers these new columns.
