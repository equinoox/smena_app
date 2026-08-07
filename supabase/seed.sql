-- Seeds 3 real accounts and their data: Marko (StarBucks - Novi Beograd, 1 listing),
-- Darko (two venues — McDonald's Zvezdara with 1 listing, McDonald's Novi Beograd with
-- none — exercising multi-venue), and Nikola (no venue at all, one venue-less
-- temporary-job listing). Run reset.sql first — this assumes an empty database (fixed
-- test ids/emails will conflict with a unique-constraint error if seeded twice in a row).
--
-- Update this file (and reset.sql) whenever the schema changes — see CLAUDE.md's
-- "Test data" note and supabase/README.md.
--
-- Run via Supabase SQL editor, or `npm run db:seed` (see supabase/README.md).
--
-- Inserting into auth.users directly (bypassing the real sign-up API) is the
-- standard Supabase seeding pattern: it fires handle_new_user() same as a real
-- signUp() call, auto-creating the matching `profiles` row. pgcrypto is needed for
-- password hashing (crypt/gen_salt); Supabase projects have it available by default.
--
-- Password for all 3 accounts: 12345678. Each auth.users row is paired with an
-- auth.identities row (email provider) — without it, GoTrue's password grant fails
-- with a 500 rather than a clean "invalid credentials" (inserting straight into
-- auth.users alone isn't enough to actually log in as one of these). This is the
-- current (2023+) auth.identities shape; if your project is on a very different GoTrue
-- version and this errors, create the account by hand through the app instead.
create extension if not exists pgcrypto;

-- Venue 1: StarBucks - Novi Beograd (Marko Marković) -------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'marko@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Marko Marković","phone":"+381600277244"}',
  '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"marko@gmail.com","email_verified":true}',
  'email', now(), now(), now()
);

insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone,
  logo_url, cover_photo_url
) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'StarBucks - Novi Beograd', 'cafe',
  'StarBucks - Novi Beograd ☕
Nudi prijatnu ambijent, kafu i ljubazno osoblje!
Idealno mesto za opuštenu kaficu i druženje sa prijateljima.',
  'Ušće', 'Beograd', 44.815346, 20.435282,
  '1234', '+381600277244',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/0230e399-5c53-490c-b4c4-918042bf7504/logo-1786132644655.jpeg',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/0230e399-5c53-490c-b4c4-918042bf7504/cover-1786132618443.jpeg'
);

insert into listings (
  id, venue_id, owner_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, start_hour, end_hour, is_urgent, requirements
) values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Starbucks - START Program', 'bartender', 'full_time',
  'Započni svoju karijeru u Starbucks-u!
Novi program obuke radnika za zvanje profesionalnog kafe majstora!
Idealni uslovi ☕
Povećanje plate tokom vremena 💶
Dobra ekipa 💪🏼
Pridruži se! 💯',
  3000, 'month', 'RSD',
  9, 17,
  false, '{Engleski jezik,Pravljenje kafe}'
);

-- Venue 2: McDonald's Zvezdara (Darko Darković) --------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated',
  'darko@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Darko Darković","phone":"+381600277244"}',
  '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"darko@gmail.com","email_verified":true}',
  'email', now(), now(), now()
);

insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone,
  logo_url, cover_photo_url
) values (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000002',
  'McDonald''s Zvezdara', 'fast_food',
  'McDonald''s Zvezdara 🍔
McDonald''s je poznat po brzoj usluzi, prepoznatljivim burgerima, pomfritu i raznovrsnoj ponudi.
Restoran nude opušten ambijent, pogodan za brz obrok i druženje sa prijateljima!',
  'Braće Ribnikar 54', 'Beograd', 44.805206, 20.485633,
  '1234', '+381600277244',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/29f3f4a6-169b-463a-a3e2-ed19f940f6d0/logo-1786133248588.png',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/29f3f4a6-169b-463a-a3e2-ed19f940f6d0/cover-1786133248589.jpeg'
);

insert into listings (
  id, venue_id, owner_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, start_hour, end_hour, is_urgent, requirements
) values (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000002',
  'McDonald''s Kuvar', 'cook', 'full_time',
  'Tražimo  komunikativne, odgovorne i motivisane osobe koje žele da postanu deo našeg tima.
Nudimo fleksibilno radno vreme, prijatno radno okruženje i mogućnost napredovanja.
Hitno potreban radnik!',
  60000, 'month', 'RSD',
  10, 14,
  true, '{Kuvar}'
);

-- Venue 2b: a second lokal for the same owner (Darko) — multi-venue, no listing yet --
insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone,
  logo_url, cover_photo_url
) values (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000002',
  'McDonald''s Novi Beograd', 'fast_food',
  'McDonald''s Novi Beograd 🍔
Naš novi restoran na Novom Beogradu nudi prepoznatljivu hranu i još bolju zabavu i uživanje u jelu!
Zahvaljujući dobroj organizaciji i jednostavnom načinu elektronskog naručivanja, gosti mogu brzo i lako uživati u svom obroku. 💯',
  'Jurija Gagarina 14', 'Beograd', 44.80483, 20.408657,
  '1235', '+381600277244',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/29f3f4a6-169b-463a-a3e2-ed19f940f6d0/logo-1786137094907.png',
  'https://csdnkxfjfjiyymjweivr.supabase.co/storage/v1/object/public/venue-logos/29f3f4a6-169b-463a-a3e2-ed19f940f6d0/cover-1786137094909.png'
);

-- Nikola Nikolić — no venue at all, only posts venue-less temporary-job listings ------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated',
  'nikola@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Nikola Nikolić","phone":"+381600277244"}',
  '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '{"sub":"00000000-0000-0000-0000-000000000003","email":"nikola@gmail.com","email_verified":true}',
  'email', now(), now(), now()
);

-- A temporary-job listing not tied to any venue — only fill_in/part_time employment
-- types are allowed without a venue (see the DB check constraint).
insert into listings (
  id, owner_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, start_hour, end_hour, is_urgent, requirements,
  address, city, lat, lng
) values (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000003',
  'Festival Belgrade Waterfront', 'cocktail_master', 'part_time',
  'Potreban koktel majstor za festival koji se održava na Beogradu na vodi.
Posao je za štandom, neophodno je pravljenje 10 različitih vrsta koktela, naplaćuje se putem kupona.',
  4500, 'shift', 'RSD',
  10, 20,
  true, '{Brz rad}',
  'Savski trg 11', 'Beograd', 44.80799, 20.457209
);
