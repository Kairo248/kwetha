create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  event_type text not null,
  provider_reference text not null,
  provider_status text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  customer_email text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, event_type, provider_reference)
);

create index if not exists idx_payment_transactions_order_id on public.payment_transactions(order_id);
create index if not exists idx_payment_transactions_reference on public.payment_transactions(provider_reference);
create index if not exists idx_orders_payment_reference on public.orders(payment_reference);
create index if not exists idx_tickets_event_id on public.tickets(event_id);

create or replace trigger payment_transactions_set_updated_at
before update on public.payment_transactions
for each row execute procedure public.set_updated_at();

alter table public.payment_transactions enable row level security;