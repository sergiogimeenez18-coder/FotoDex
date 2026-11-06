-- FotoDex cloud schema (review before applying to an existing project).
-- All social content is private by default. Image objects use the private
-- `captures` Storage bucket and the first path segment must be the owner's UUID.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null default 'Explorador FotoDex',
  bio text not null default '',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_bio_length check (char_length(bio) <= 240)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_no_self check (follower_id <> followed_id)
);

create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  common_name text not null,
  scientific_name text not null default '',
  animal_group text not null,
  habitat text not null default '',
  country text not null default '',
  place text not null default '',
  captured_on date not null default current_date,
  notes text not null default '',
  image_path text not null unique,
  image_width integer,
  image_height integer,
  identification_source text not null default 'manual',
  identification_confidence real,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint captures_common_name_length check (char_length(common_name) between 1 and 90),
  constraint captures_notes_length check (char_length(notes) <= 500),
  constraint captures_group_valid check (animal_group in ('aves','mamiferos','reptiles','anfibios','insectos','peces','otros')),
  constraint captures_visibility_valid check (visibility in ('private','followers','public')),
  constraint captures_identification_source_valid check (identification_source in ('manual','ai','community')),
  constraint captures_confidence_valid check (identification_confidence is null or identification_confidence between 0 and 1),
  constraint captures_image_dimensions_valid check ((image_width is null or image_width > 0) and (image_height is null or image_height > 0))
);

-- If this draft has already been applied, move any future GPS storage into the
-- owner-only table below before the client starts saving user observations.
alter table public.captures drop column if exists latitude;
alter table public.captures drop column if exists longitude;

-- Exact GPS coordinates are stored separately and are readable only by the owner.
create table if not exists public.capture_private_locations (
  capture_id uuid primary key references public.captures (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now(),
  constraint capture_private_latitude_valid check (latitude between -90 and 90),
  constraint capture_private_longitude_valid check (longitude between -180 and 180)
);

create table if not exists public.capture_likes (
  capture_id uuid not null references public.captures (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (capture_id, user_id)
);

create table if not exists public.capture_comments (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid not null references public.captures (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint capture_comments_body_length check (char_length(body) between 1 and 500)
);

create index if not exists follows_followed_idx on public.follows (followed_id, follower_id);
create index if not exists captures_user_created_idx on public.captures (user_id, created_at desc);
create index if not exists captures_visibility_created_idx on public.captures (visibility, created_at desc);
create index if not exists captures_species_idx on public.captures (animal_group, common_name);
create index if not exists capture_comments_feed_idx on public.capture_comments (capture_id, created_at desc);
create index if not exists capture_comments_user_idx on public.capture_comments (user_id);
create index if not exists capture_likes_user_idx on public.capture_likes (user_id, created_at desc);
create index if not exists capture_private_locations_user_idx on public.capture_private_locations (user_id);

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.captures enable row level security;
alter table public.capture_private_locations enable row level security;
alter table public.capture_likes enable row level security;
alter table public.capture_comments enable row level security;

-- New projects no longer expose new public tables to the Data API by default;
-- explicitly grant only authenticated users, then constrain rows with RLS.
revoke all on public.profiles, public.follows, public.captures, public.capture_private_locations, public.capture_likes, public.capture_comments from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.follows to authenticated;
grant select, insert, update, delete on public.captures to authenticated;
grant select, insert, update, delete on public.capture_private_locations to authenticated;
grant select, insert, delete on public.capture_likes to authenticated;
grant select, insert, delete on public.capture_comments to authenticated;

drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists follows_read_related on public.follows;
create policy follows_read_related on public.follows
  for select to authenticated using ((select auth.uid()) in (follower_id, followed_id));
drop policy if exists follows_insert_self on public.follows;
create policy follows_insert_self on public.follows
  for insert to authenticated with check ((select auth.uid()) = follower_id);
drop policy if exists follows_delete_self on public.follows;
create policy follows_delete_self on public.follows
  for delete to authenticated using ((select auth.uid()) = follower_id);

drop policy if exists captures_read_visible on public.captures;
create policy captures_read_visible on public.captures
  for select to authenticated using (
    user_id = (select auth.uid())
    or visibility = 'public'
    or (visibility = 'followers' and exists (
      select 1 from public.follows f
      where f.follower_id = (select auth.uid()) and f.followed_id = captures.user_id
    ))
  );
drop policy if exists captures_insert_self on public.captures;
create policy captures_insert_self on public.captures
  for insert to authenticated with check (
    user_id = (select auth.uid()) and image_path like (select auth.uid())::text || '/%'
  );
drop policy if exists captures_update_self on public.captures;
create policy captures_update_self on public.captures
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and image_path like (select auth.uid())::text || '/%');
drop policy if exists captures_delete_self on public.captures;
create policy captures_delete_self on public.captures
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists capture_private_locations_read_self on public.capture_private_locations;
create policy capture_private_locations_read_self on public.capture_private_locations
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists capture_private_locations_insert_self on public.capture_private_locations;
create policy capture_private_locations_insert_self on public.capture_private_locations
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.captures c where c.id = capture_private_locations.capture_id and c.user_id = (select auth.uid())
    )
  );
drop policy if exists capture_private_locations_update_self on public.capture_private_locations;
create policy capture_private_locations_update_self on public.capture_private_locations
  for update to authenticated using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.captures c where c.id = capture_private_locations.capture_id and c.user_id = (select auth.uid())
    )
  );
drop policy if exists capture_private_locations_delete_self on public.capture_private_locations;
create policy capture_private_locations_delete_self on public.capture_private_locations
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists capture_likes_read_visible on public.capture_likes;
create policy capture_likes_read_visible on public.capture_likes
  for select to authenticated using (exists (
    select 1 from public.captures c where c.id = capture_likes.capture_id
  ));
drop policy if exists capture_likes_insert_self_visible on public.capture_likes;
create policy capture_likes_insert_self_visible on public.capture_likes
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.captures c where c.id = capture_likes.capture_id
    )
  );
drop policy if exists capture_likes_delete_self on public.capture_likes;
create policy capture_likes_delete_self on public.capture_likes
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists capture_comments_read_visible on public.capture_comments;
create policy capture_comments_read_visible on public.capture_comments
  for select to authenticated using (exists (
    select 1 from public.captures c where c.id = capture_comments.capture_id
  ));
drop policy if exists capture_comments_insert_self_visible on public.capture_comments;
create policy capture_comments_insert_self_visible on public.capture_comments
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.captures c where c.id = capture_comments.capture_id
    )
  );
drop policy if exists capture_comments_delete_self on public.capture_comments;
create policy capture_comments_delete_self on public.capture_comments
  for delete to authenticated using (user_id = (select auth.uid()));

-- Private image bucket. Upload each compressed JPEG to <user-uuid>/<capture-uuid>.jpg.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('captures', 'captures', false, 10485760, array['image/jpeg','image/webp'])
on conflict (id) do nothing;

drop policy if exists capture_images_insert_owner on storage.objects;
create policy capture_images_insert_owner on storage.objects
  for insert to authenticated with check (
    bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists capture_images_read_visible on storage.objects;
create policy capture_images_read_visible on storage.objects
  for select to authenticated using (
    bucket_id = 'captures' and exists (
      select 1 from public.captures c where c.image_path = storage.objects.name
    )
  );
drop policy if exists capture_images_update_owner on storage.objects;
create policy capture_images_update_owner on storage.objects
  for update to authenticated using (
    bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text
  ) with check (
    bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists capture_images_delete_owner on storage.objects;
create policy capture_images_delete_owner on storage.objects
  for delete to authenticated using (
    bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
