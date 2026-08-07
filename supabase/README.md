# Supabase setup

Run `migrations/0001_init.sql` in the Supabase SQL editor (Dashboard → SQL Editor),
or via the Supabase CLI (`supabase db push`).

`0001_init.sql` is the consolidated first-version schema: enums, tables, triggers
(incl. auto-profile on signup), RLS policies, and storage buckets — squashed from
what were originally ten incremental migrations, before any real users existed.
From here on, every schema change is a new migration on top of this one
(`0002_...`, `0003_...`, etc.) — don't edit `0001_init.sql` again once there's real data.

## Test data

`reset.sql` wipes every table (via `delete from auth.users`, which cascades through
every FK). `seed.sql` then creates 4 test accounts — 1 worker + 3 venues at different
real Belgrade locations, each venue with one open listing — for exercising
location-dependent features (distance/near-me).

Run both by pasting their contents into the Supabase dashboard's SQL Editor and
clicking Run — `reset.sql` first, then `seed.sql`. (There's no local `psql`/npm-script
tooling for this — dashboard only.)

**Keep both files in sync with the schema** — whenever a migration adds/renames/drops
a column those scripts touch, update `reset.sql`/`seed.sql` (and this note) in the
same change.

## Notes

- **Auth**: `handle_new_user()` reads `role`, `full_name`, `phone` from the signup
  user metadata (`supabase.auth.signUp({ options: { data: { ... } } })`) and creates
  the matching `profiles` row automatically.
- **Phone**: stored as profile data only. Phone-OTP login needs a paid SMS provider —
  not wired. MVP uses email/password.
- **Geo/maps**: `venues.lat` / `venues.lng` are stored now. To add radius search later,
  enable PostGIS (`create extension postgis;`) and add a generated `geography` column —
  see the commented block in `0001_init.sql`.
- **Regenerate types**: after changing the schema, regenerate
  `src/shared/types/database.types.ts` with
  `supabase gen types typescript --project-id <ref> > src/shared/types/database.types.ts`.
