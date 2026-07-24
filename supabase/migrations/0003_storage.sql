-- Storage buckets for profile avatars and venue logos (public read, owner write).
-- Files are stored under a top-level folder equal to the user's id: `<uid>/<file>`.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('venue-logos', 'venue-logos', true)
on conflict (id) do nothing;

-- Public read for both buckets.
create policy "public read of avatars and logos"
  on storage.objects for select
  to public
  using (bucket_id in ('avatars', 'venue-logos'));

-- Authenticated users can manage only files inside their own id folder.
create policy "users manage their own avatar files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own avatar files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own avatar files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'venue-logos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
