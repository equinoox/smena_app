-- Adds free-form requirement tags a venue can attach to a listing when posting it
-- (e.g. "Iskustvo sa šankom", "Dostupnost vikendom"), shown on the create-listing screen.
alter table listings
  add column requirements text[] not null default '{}';
