create table if not exists public.homepage_hero (
  id text primary key,
  eyebrow text not null,
  title text not null,
  description text not null,
  primary_cta_label text not null,
  primary_cta_href text not null,
  secondary_cta_label text not null,
  secondary_cta_href text not null,
  media_path text,
  media_kind text not null check (media_kind in ('image', 'video')),
  media_eyebrow text not null,
  media_title text not null,
  metric_one_value text not null,
  metric_one_label text not null,
  metric_two_value text not null,
  metric_two_label text not null,
  metric_three_value text not null,
  metric_three_label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace trigger homepage_hero_set_updated_at
before update on public.homepage_hero
for each row execute function public.set_updated_at();

alter table public.homepage_hero enable row level security;

create policy "Public can read homepage hero" on public.homepage_hero
for select using (true);

insert into public.homepage_hero (
  id,
  eyebrow,
  title,
  description,
  primary_cta_label,
  primary_cta_href,
  secondary_cta_label,
  secondary_cta_href,
  media_kind,
  media_eyebrow,
  media_title,
  metric_one_value,
  metric_one_label,
  metric_two_value,
  metric_two_label,
  metric_three_value,
  metric_three_label
)
values (
  'default',
  'Premium Brand Infrastructure',
  'A modern digital home for Lilitha''s story, products, and live experiences.',
  'Designed to look premium in public, stay rigorous behind the scenes, and scale from intimate launches to high-demand ticket drops.',
  'Explore events',
  '/events',
  'Shop the store',
  '/store',
  'image',
  'Campaign preview',
  'Story in motion',
  '24+',
  'Content collections',
  '5k+',
  'Scalable users',
  '500',
  'Quota-aware tickets'
)
on conflict (id) do nothing;