-- Adds more venue types and a new worker role, and drops listings' specific-calendar-date
-- concept in favor of an optional daily time-of-day window (e.g. "16:00-24:00") — a
-- "Stalno" (full-time) listing was never really tied to a single date anyway.
alter type venue_type add value if not exists 'pub';
alter type venue_type add value if not exists 'kafana';
alter type venue_type add value if not exists 'fast_food';
alter type worker_role add value if not exists 'cocktail_master';

-- `kitchen_helper` is intentionally kept in the enum (removing an enum value is
-- destructive/risky in Postgres) — it's just dropped from the picker array in
-- src/shared/lib/roleIcon.ts, not from the database.

alter table listings
  drop column starts_at,
  drop column ends_at,
  add column start_hour smallint check (start_hour between 0 and 24),
  add column end_hour smallint check (end_hour between 0 and 24);
