create extension if not exists pgcrypto;

create type public.app_role as enum ('viewer', 'customer', 'admin');
create type public.item_type as enum ('book', 'merch', 'ticket');
create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled', 'fulfilled');
create type public.content_kind as enum ('article', 'video', 'gallery');
create type public.audience_category as enum ('youth', 'senior');
create type public.ticket_status as enum ('valid', 'used', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'customer',
  date_of_birth date,
  phone text,
  city text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  item_type public.item_type not null,
  price_cents integer not null check (price_cents >= 0),
  inventory_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  venue text not null,
  starts_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  youth_quota integer not null check (youth_quota >= 0),
  senior_quota integer not null check (senior_quota >= 0),
  ticket_price_cents integer not null check (ticket_price_cents >= 0),
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (youth_quota + senior_quota <= capacity)
);

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_kind public.content_kind not null,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  payment_reference text unique,
  status public.order_status not null default 'pending',
  subtotal_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'ZAR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  reference text not null unique,
  audience_category public.audience_category not null,
  status public.ticket_status not null default 'valid',
  qr_code_path text,
  attendee_name text,
  attendee_email text,
  date_of_birth date not null,
  checked_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.tickets(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  response jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_events_starts_at on public.events(starts_at);
create index if not exists idx_items_type_active on public.items(item_type, is_active);
create index if not exists idx_orders_user_status on public.orders(user_id, status);
create index if not exists idx_tickets_event_category_status on public.tickets(event_id, audience_category, status);
create index if not exists idx_content_featured_published on public.content(featured, published_at desc);
create index if not exists idx_form_responses_form on public.form_responses(form_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace trigger items_set_updated_at
before update on public.items
for each row execute procedure public.set_updated_at();

create or replace trigger events_set_updated_at
before update on public.events
for each row execute procedure public.set_updated_at();

create or replace trigger content_set_updated_at
before update on public.content
for each row execute procedure public.set_updated_at();

create or replace trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create or replace trigger tickets_set_updated_at
before update on public.tickets
for each row execute procedure public.set_updated_at();

create or replace function public.resolve_audience_category(p_date_of_birth date)
returns public.audience_category
language sql
stable
as $$
  select case
    when extract(year from age(current_date, p_date_of_birth)) < 35 then 'youth'::public.audience_category
    else 'senior'::public.audience_category
  end;
$$;

create or replace function public.reserve_ticket(
  p_event_id uuid,
  p_user_id uuid,
  p_attendee_name text,
  p_attendee_email text,
  p_date_of_birth date,
  p_payment_reference text,
  p_amount_cents integer
)
returns public.tickets
language plpgsql
security definer
as $$
declare
  target_event public.events;
  target_category public.audience_category;
  sold_count integer;
  next_sequence integer;
  created_order public.orders;
  created_ticket public.tickets;
begin
  select * into target_event
  from public.events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  target_category := public.resolve_audience_category(p_date_of_birth);

  select count(*) into sold_count
  from public.tickets
  where event_id = p_event_id
    and audience_category = target_category
    and status in ('valid', 'used');

  if target_category = 'youth' and sold_count >= target_event.youth_quota then
    raise exception 'Youth quota is full';
  end if;

  if target_category = 'senior' and sold_count >= target_event.senior_quota then
    raise exception 'Senior quota is full';
  end if;

  insert into public.orders (user_id, payment_reference, status, subtotal_cents, total_cents)
  values (p_user_id, p_payment_reference, 'paid', p_amount_cents, p_amount_cents)
  returning * into created_order;

  select coalesce(max((regexp_replace(reference, '^IKW-[0-9]{4}-', ''))::integer), 0) + 1
  into next_sequence
  from public.tickets;

  insert into public.tickets (
    user_id,
    event_id,
    reference,
    audience_category,
    attendee_name,
    attendee_email,
    date_of_birth,
    status
  )
  values (
    p_user_id,
    p_event_id,
    'IKW-' || to_char(current_date, 'YYYY') || '-' || lpad(next_sequence::text, 4, '0'),
    target_category,
    p_attendee_name,
    p_attendee_email,
    p_date_of_birth,
    'valid'
  )
  returning * into created_ticket;

  insert into public.ticket_orders (ticket_id, order_id, amount_cents)
  values (created_ticket.id, created_order.id, p_amount_cents);

  return created_ticket;
end;
$$;

create or replace function public.validate_ticket_scan(
  p_ticket_reference text,
  p_event_id uuid default null
)
returns public.tickets
language plpgsql
security definer
as $$
declare
  found_ticket public.tickets;
begin
  select * into found_ticket
  from public.tickets
  where reference = p_ticket_reference
    and (p_event_id is null or event_id = p_event_id)
  for update;

  if not found then
    raise exception 'Ticket not found';
  end if;

  if found_ticket.status = 'used' then
    raise exception 'Ticket already used';
  end if;

  if found_ticket.status <> 'valid' then
    raise exception 'Ticket is not valid';
  end if;

  update public.tickets
  set status = 'used', checked_in_at = timezone('utc', now())
  where id = found_ticket.id
  returning * into found_ticket;

  return found_ticket;
end;
$$;

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
alter table public.content enable row level security;

create policy "Public can read published events" on public.events
for select using (published = true);

create policy "Public can read active items" on public.items
for select using (is_active = true);

create policy "Public can read published content" on public.content
for select using (published_at is not null);