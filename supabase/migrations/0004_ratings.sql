-- Two-sided rating system: venues rate workers (productivity/reliability/quality),
-- workers rate venues (conditions/atmosphere/benefits). Open (no "shift completed"
-- gate — that status doesn't exist yet) and editable (one row per rater/target pair,
-- resubmitting updates it via upsert). Averages are cached on profiles/venues so every
-- existing query that already returns a worker or venue carries its rating for free.

create table worker_ratings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references profiles (id) on delete cascade,
  rater_id uuid not null references profiles (id) on delete cascade, -- the venue owner's profile
  productivity smallint not null check (productivity between 0 and 5),
  reliability smallint not null check (reliability between 0 and 5),
  quality smallint not null check (quality between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (worker_id, rater_id)
);

create index worker_ratings_worker_id_idx on worker_ratings (worker_id);

create trigger worker_ratings_set_updated_at
  before update on worker_ratings
  for each row execute function set_updated_at();

create table venue_ratings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  rater_id uuid not null references profiles (id) on delete cascade, -- the worker's profile
  conditions smallint not null check (conditions between 0 and 5),
  atmosphere smallint not null check (atmosphere between 0 and 5),
  benefits smallint not null check (benefits between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, rater_id)
);

create index venue_ratings_venue_id_idx on venue_ratings (venue_id);

create trigger venue_ratings_set_updated_at
  before update on venue_ratings
  for each row execute function set_updated_at();

-- Cached aggregates -------------------------------------------------------------
alter table profiles
  add column rating_avg numeric(2, 1),
  add column rating_count integer not null default 0;

alter table venues
  add column rating_avg numeric(2, 1),
  add column rating_count integer not null default 0;

create or replace function refresh_worker_rating_cache()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.worker_id, old.worker_id);
begin
  update profiles p set
    rating_count = sub.cnt,
    rating_avg = sub.avg_r
  from (
    select
      count(*) as cnt,
      round(avg((productivity + reliability + quality) / 3.0)::numeric, 1) as avg_r
    from worker_ratings
    where worker_id = target
  ) sub
  where p.id = target;
  return null;
end;
$$;

create trigger worker_ratings_refresh_cache
  after insert or update or delete on worker_ratings
  for each row execute function refresh_worker_rating_cache();

create or replace function refresh_venue_rating_cache()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.venue_id, old.venue_id);
begin
  update venues v set
    rating_count = sub.cnt,
    rating_avg = sub.avg_r
  from (
    select
      count(*) as cnt,
      round(avg((conditions + atmosphere + benefits) / 3.0)::numeric, 1) as avg_r
    from venue_ratings
    where venue_id = target
  ) sub
  where v.id = target;
  return null;
end;
$$;

create trigger venue_ratings_refresh_cache
  after insert or update or delete on venue_ratings
  for each row execute function refresh_venue_rating_cache();

-- Row Level Security ============================================================
alter table worker_ratings enable row level security;

create policy "worker ratings are readable by authenticated users"
  on worker_ratings for select
  to authenticated
  using (true);

create policy "venue owners can rate workers"
  on worker_ratings for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role = 'venue')
  );

create policy "venue owners can update their own worker rating"
  on worker_ratings for update
  to authenticated
  using (rater_id = auth.uid())
  with check (rater_id = auth.uid());

alter table venue_ratings enable row level security;

create policy "venue ratings are readable by authenticated users"
  on venue_ratings for select
  to authenticated
  using (true);

create policy "workers can rate venues"
  on venue_ratings for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role = 'worker')
  );

create policy "workers can update their own venue rating"
  on venue_ratings for update
  to authenticated
  using (rater_id = auth.uid())
  with check (rater_id = auth.uid());
