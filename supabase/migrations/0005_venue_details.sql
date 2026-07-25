-- Adds venue-detail fields collected on the venue sign-up "Podaci o lokalu" step:
-- tax id (PIB) and the venue's own public contact phone (separate from the owner's
-- personal profiles.phone). Nullable at the DB level — required-ness is enforced by
-- the sign-up form's Zod schema, not a DB constraint, since there are no users yet
-- and a hard NOT NULL would need a backfill for any already-seeded test rows.
alter table venues
  add column pib text,
  add column phone text;
