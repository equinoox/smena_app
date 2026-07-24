# Smena — manual setup (do these before the app can run)

Everything below is outside the code and only you can do it. All of it fits the free tier.

## 1. Create the Supabase project
1. Go to https://supabase.com → **New project** (free tier). Pick a region close to Serbia
   (e.g. Frankfurt / `eu-central`).
2. Wait for it to provision, then open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 2. Add your keys to the app
1. Copy `.env.example` to `.env` in the project root.
2. Paste your values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
   `.env` is gitignored — never commit it.

## 3. Run the database migrations
In the Supabase dashboard → **SQL Editor**, run these files in order (copy/paste contents):
1. `supabase/migrations/0001_init.sql` — tables, enums, triggers (auto-creates a profile on signup)
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies
3. `supabase/migrations/0003_storage.sql` — `avatars` + `venue-logos` storage buckets

## 4. Auth settings (important for the MVP flow)
- **Auth → Providers → Email**: for a zero-friction MVP, turn **OFF** "Confirm email".
  The venue sign-up needs a session immediately to create the venue row. (With confirmation on,
  the app still works but the user must confirm via email, then sign in, and venue creation would
  need to move to first login — tell me if you'd rather keep confirmation on.)
- Auth mechanism is **email/password** (default). Phone OTP is intentionally not wired (needs a
  paid SMS provider). Google/Apple OAuth can be added later if you want.

## 5. Run the app on your device
- Install **Expo Go** from the App Store / Play Store (all native modules used here are
  Expo Go compatible), then from the project run `npm run start` **yourself** and scan the QR.
- (Claude will not start the dev server for you.)

## 6. Later / when you scale (not needed now)
- **EAS account** (https://expo.dev) for standalone/TestFlight/Play builds: `npx eas build`.
- **Maps**: add `react-native-maps` + enable PostGIS for radius search (`venues.lat/lng` already stored).
- **Regenerate DB types** after schema changes:
  `supabase gen types typescript --project-id <ref> > src/shared/types/database.types.ts`.

## Decisions I need from you
- ✅/❌ Keep email confirmation OFF for the MVP (recommended)?
- The **light-mode palette** was derived from your dark tokens (same hues, light surfaces /
  dark text) — please eyeball it on device and tell me what to adjust.
- Confirm the app name "Smena" for now (you mentioned it may change).
