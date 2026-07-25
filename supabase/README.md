# Supabase setup

Run these migrations in order in the Supabase SQL editor (Dashboard → SQL Editor),
or via the Supabase CLI (`supabase db push`).

1. `migrations/0001_init.sql` — enums, tables, triggers (incl. auto-profile on signup).
2. `migrations/0002_rls.sql` — Row Level Security policies (role/ownership scoped).
3. `migrations/0003_storage.sql` — `avatars` + `venue-logos` storage buckets & policies.
4. `migrations/0004_worker_profile_fields.sql` — `profiles.worker_roles` + `profiles.experience_level`.
5. `migrations/0005_listing_views.sql` — `listing_views` table (a worker opening a listing logs a view; powers venue home stats).

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
