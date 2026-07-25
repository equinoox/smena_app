-- Worker profile fields: positions (multi-select) + experience level, set during sign-up.
create type experience_level as enum ('none', '1_3_years', '3plus_years');

alter table profiles
  add column worker_roles worker_role[] not null default '{}',
  add column experience_level experience_level;
