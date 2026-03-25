alter table public.events
add column if not exists banner_image_path text;

alter table public.items
add column if not exists image_path text;