# Supabase setup

Run `migrations/0001_init.sql` in the Supabase SQL editor (Dashboard → SQL Editor),
or via the Supabase CLI (`supabase db push`).

`0001_init.sql` is the consolidated first-version schema: enums, tables, triggers
(incl. auto-profile on signup), RLS policies, and storage buckets — squashed from
what were originally ten incremental migrations, before any real users existed.
From here on, every schema change is a new migration on top of this one
(`0002_...`, `0003_...`, etc.) — don't edit `0001_init.sql` again once there's real data.

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
