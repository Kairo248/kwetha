do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'content_kind' and e.enumlabel = 'image'
  ) then
    alter type public.content_kind add value 'image';
  end if;
end $$;

alter table public.content
add column if not exists category text;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_path text,
  website_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_brands_active_sort on public.brands(is_active, sort_order, created_at desc);

create or replace trigger brands_set_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

alter table public.brands enable row level security;