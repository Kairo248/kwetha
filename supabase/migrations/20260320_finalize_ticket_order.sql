create or replace function public.finalize_ticket_order(
  p_order_id uuid,
  p_event_id uuid,
  p_user_id uuid,
  p_attendee_name text,
  p_attendee_email text,
  p_date_of_birth date
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
  existing_ticket_id uuid;
  created_ticket public.tickets;
  existing_order public.orders;
begin
  select * into existing_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  select ticket_id into existing_ticket_id
  from public.ticket_orders
  where order_id = p_order_id;

  if existing_ticket_id is not null then
    select * into created_ticket
    from public.tickets
    where id = existing_ticket_id;

    return created_ticket;
  end if;

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
  values (created_ticket.id, p_order_id, existing_order.total_cents);

  update public.orders
  set status = 'paid'
  where id = p_order_id;

  return created_ticket;
end;
$$;