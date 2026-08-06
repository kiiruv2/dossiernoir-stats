create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  platform text not null,
  dossier text,
  title text not null,
  hook text,
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz default now(),
  unique(platform, external_id)
);

create table if not exists public.video_snapshots (
  id bigint generated always as identity primary key,
  video_id uuid references public.videos(id) on delete cascade,
  captured_at timestamptz default now(),
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  followers_gained bigint default 0,
  retention numeric,
  completion numeric,
  viral_score integer,
  revenue_estimate_eur numeric
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);
