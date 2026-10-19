create extension if not exists pgcrypto;

create table if not exists public.songs (
  id text primary key, title text not null, artists text[] not null default '{}', release_year integer,
  genres text[], region text, vocal_type text not null default 'unknown', cover_url text,
  spotify_id text, spotify_uri text, spotify_url text, album text, duration_ms integer,
  metadata_source text not null, added_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.user_songs (
  user_id uuid not null references auth.users(id) on delete cascade, song_id text not null references public.songs(id),
  used boolean not null default false, favorite boolean not null default false, discovered_at timestamptz,
  used_at timestamptz, notes text, primary key(user_id,song_id)
);
create table if not exists public.roulette_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  song_id text not null references public.songs(id), filters jsonb not null default '{}'::jsonb,
  discarded_ids text[] not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  song_id text not null references public.songs(id), episode_number integer not null,
  caption text not null default '', hashtags text[] not null default '{}', status text not null default 'Pendiente',
  reel_url text, notes text, publish_date date, views integer, likes integer, comments integer,
  created_at timestamptz not null default now(), unique(user_id,episode_number)
);
-- Snapshot allows lossless local-first migration while the normalized tables remain available to later sync versions.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null, updated_at timestamptz not null default now()
);
create index if not exists roulette_sessions_user_created_idx on public.roulette_sessions(user_id,created_at desc);
create index if not exists content_posts_user_created_idx on public.content_posts(user_id,created_at desc);
create index if not exists songs_year_idx on public.songs(release_year);
create index if not exists songs_region_idx on public.songs(region);

alter table public.songs enable row level security;
alter table public.profiles enable row level security;
alter table public.user_songs enable row level security;
alter table public.roulette_sessions enable row level security;
alter table public.content_posts enable row level security;
alter table public.user_state enable row level security;
create policy "catalog is readable" on public.songs for select using (true);
create policy "profiles own row" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "user songs own rows" on public.user_songs for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "sessions own rows" on public.roulette_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "posts own rows" on public.content_posts for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "state own row" on public.user_state for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke insert, update, delete on public.songs from anon, authenticated;
