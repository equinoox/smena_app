-- Seeds 4 test accounts for exercising location-dependent features: 1 worker
-- (home address in Novi Beograd) + 3 venues (Centar, Zemun, Vračar), each with one
-- open listing, spread across Belgrade so distance/near-me logic has something real
-- to sort. Run reset.sql first — this assumes an empty database (fixed test ids/
-- emails will conflict with a unique-constraint error if seeded twice in a row).
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
-- Note: these accounts are for populating data to BROWSE, not to sign in as — there's
-- no matching auth.identities row, so the app's email/password sign-in won't
-- authenticate them (that table's shape varies across GoTrue versions, too fragile to
-- seed reliably here). Browse/test from your own real account instead.
create extension if not exists pgcrypto;

-- Worker: Test Radnik — home address in Novi Beograd ---------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'test.worker1@smena.test',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"worker","full_name":"Test Radnik","phone":"+381601111111"}',
  '', ''
);

update profiles set
  worker_roles = '{waiter,bartender}',
  experience_level = '1_3_years',
  skills = '{Rad sa gostima,Brzina}',
  is_available = true,
  bio = 'Test profil radnika za proveru lokacije.',
  address = 'Bulevar Zorana Đinđića 10, Novi Beograd',
  city = 'Beograd',
  lat = 44.8125,
  lng = 20.3906
where id = '00000000-0000-0000-0000-000000000001';

-- Venue 1: Test Kafić Centar (Knez Mihailova) -----------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated',
  'test.venue1@smena.test',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Test Vlasnik Centar","phone":"+381601111112"}',
  '', ''
);

insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone
) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000002',
  'Test Kafić Centar', 'cafe',
  'Test kafić u centru grada.',
  'Knez Mihailova 5', 'Beograd', 44.8172, 20.4573,
  '100000001', '+381601111112'
);

insert into listings (
  id, venue_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, start_hour, end_hour, is_urgent, requirements
) values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Konobar za vikend', 'waiter', 'part_time',
  'Potreban konobar za rad vikendom u kafiću u centru.',
  600, 'shift', 'RSD',
  16, 24,
  true, '{Iskustvo sa šankom}'
);

-- Venue 2: Test Bar Zemun (Kej oslobođenja) --------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated',
  'test.venue2@smena.test',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Test Vlasnik Zemun","phone":"+381601111113"}',
  '', ''
);

insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone
) values (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000003',
  'Test Bar Zemun', 'bar',
  'Test bar na keju u Zemunu.',
  'Kej oslobođenja 15, Zemun', 'Beograd', 44.8438, 20.4009,
  '100000002', '+381601111113'
);

insert into listings (
  id, venue_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, start_hour, end_hour, is_urgent, requirements
) values (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000102',
  'Šanker za smenu', 'bartender', 'fill_in',
  'Potreban šanker za jednu smenu, hitno.',
  500, 'hour', 'RSD',
  18, 24,
  false, '{Rad pod pritiskom}'
);

-- Venue 3: Test Restoran Vračar (Njegoševa) --------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated',
  'test.venue3@smena.test',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"venue","full_name":"Test Vlasnik Vračar","phone":"+381601111114"}',
  '', ''
);

insert into venues (
  id, owner_id, name, venue_type, description, address, city, lat, lng, pib, phone
) values (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000004',
  'Test Restoran Vračar', 'restaurant',
  'Test restoran na Vračaru.',
  'Njegoševa 45, Vračar', 'Beograd', 44.7972, 20.4718,
  '100000003', '+381601111114'
);

-- Deliberately no start_hour/end_hour — demonstrates the "Po dogovoru" (by agreement)
-- fallback in the app for permanent roles with no fixed daily hours.
insert into listings (
  id, venue_id, title, role_needed, employment_type, description,
  pay_amount, pay_period, currency, is_urgent, requirements
) values (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000103',
  'Kuvar za stalno', 'cook', 'full_time',
  'Tražimo kuvara za stalni radni odnos.',
  90000, 'month', 'RSD',
  false, '{Iskustvo u kuhinji}'
);

-- Ratings — the 3 venue owners rate the test worker, and the test worker rates the
-- 3 venues, so the star badges have something real to show right after seeding.
insert into worker_ratings (worker_id, rater_id, productivity, reliability, quality) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5, 4, 5),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 4, 4, 4),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 5, 5, 4);

insert into venue_ratings (venue_id, rater_id, conditions, atmosphere, benefits) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 4, 5, 3),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 3, 4, 3),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 5, 5, 5);
