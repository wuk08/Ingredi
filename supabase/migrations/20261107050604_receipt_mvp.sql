-- Additive receipt MVP for the six existing Ingredi tables.
-- Tighten grants as well as RLS: RLS does not protect individual columns.
revoke all on public.profiles, public.pantry_items, public.recipes, public.posts,
  public.point_transactions, public.receipt_scans from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name, city), update (display_name, city) on public.profiles to authenticated;
grant select, insert, update, delete on public.pantry_items, public.posts to authenticated;
grant select on public.recipes, public.point_transactions, public.receipt_scans to authenticated;

alter table public.receipt_scans
  add column metadata jsonb not null default '{}'::jsonb,
  add column confirmed_item_ids uuid[] not null default '{}';
alter table public.pantry_items
  add column receipt_scan_id uuid references public.receipt_scans(id) on delete set null,
  add column receipt_line integer;
create unique index pantry_receipt_line_unique on public.pantry_items(receipt_scan_id, receipt_line);
create index receipt_scans_owner_created on public.receipt_scans(user_id, created_at desc);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('receipts','receipts',false,6291456,array['image/jpeg','image/png','image/webp']);
create policy "Receipt owner may upload" on storage.objects for insert to authenticated
with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Receipt owner may read" on storage.objects for select to authenticated
using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Receipt owner may delete" on storage.objects for delete to authenticated
using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Scan writes stay server-only. A narrowly scoped private function is the sole
-- exception, so pantry insertion and scan confirmation commit in one transaction.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create function private.confirm_receipt(p_scan_id uuid, p_items jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_scan public.receipt_scans%rowtype;
  v_item jsonb;
  v_ids uuid[] := '{}';
  v_id uuid;
  v_quantity numeric;
  v_date date;
  v_line integer := 0;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into v_scan from public.receipt_scans
    where id = p_scan_id and user_id = v_uid for update;
  if not found then raise exception 'Receipt not found' using errcode = '42501'; end if;
  if v_scan.status = 'confirmed' then
    return jsonb_build_object('item_ids',v_scan.confirmed_item_ids,'count',cardinality(v_scan.confirmed_item_ids),'already_confirmed',true);
  end if;
  if v_scan.status <> 'processed' then raise exception 'Receipt is not ready to confirm'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'Items must be an array'; end if;
  if jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Select 1 to 50 items'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item->'name') is distinct from 'string'
      or length(btrim(v_item->>'name')) not between 1 and 100
      or jsonb_typeof(v_item->'unit') is distinct from 'string'
      or length(btrim(v_item->>'unit')) not between 1 and 30
      or jsonb_typeof(v_item->'quantity') is distinct from 'number' then
      raise exception 'Invalid item name, unit or quantity';
    end if;
    v_quantity := (v_item->>'quantity')::numeric;
    if v_quantity < 0.01 or v_quantity > 10000 or v_quantity <> round(v_quantity,2) then
      raise exception 'Invalid quantity';
    end if;
    v_date := null;
    if v_item->>'expires_on' is not null then
      if v_item->>'expires_on' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date'; end if;
      v_date := (v_item->>'expires_on')::date;
    end if;
    insert into public.pantry_items (user_id,name,quantity,unit,expires_on,source,receipt_scan_id,receipt_line)
    values (v_uid,btrim(v_item->>'name'),v_quantity,btrim(v_item->>'unit'),v_date,'receipt',p_scan_id,v_line)
    returning id into v_id;
    v_ids := array_append(v_ids,v_id);
    v_line := v_line + 1;
  end loop;
  update public.receipt_scans set status='confirmed', confirmed_item_ids=v_ids where id=p_scan_id and user_id=v_uid;
  return jsonb_build_object('item_ids',v_ids,'count',cardinality(v_ids),'already_confirmed',false);
end;
$$;
revoke all on function private.confirm_receipt(uuid,jsonb) from public, anon;
grant execute on function private.confirm_receipt(uuid,jsonb) to authenticated;
create function public.confirm_receipt(p_scan_id uuid, p_items jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.confirm_receipt(p_scan_id,p_items);
$$;
revoke all on function public.confirm_receipt(uuid,jsonb) from public, anon;
grant execute on function public.confirm_receipt(uuid,jsonb) to authenticated;

-- Explicitly labeled demonstration recipe content; no pantry or social data seeded.
insert into public.recipes(name,description,ingredients,instructions,cook_minutes)
values
('Spinach & cheddar omelette','Demo recipe · a quick way to use your greens.',
 '["eggs","spinach","cheddar cheese"]','["Whisk the eggs.","Wilt spinach in a lightly oiled pan.","Add eggs, then cheddar. Fold and cook until set."]',15),
('Chicken & spinach skillet','Demo recipe · a simple one-pan dinner.',
 '["chicken thighs","spinach","tomato"]','["Cut chicken into small pieces and season.","Cook in a lightly oiled pan until cooked through.","Add chopped tomatoes and spinach. Cook until the greens wilt."]',20),
('Kimchi fried rice','Demo recipe · put leftover rice to good use.',
 '["rice","kimchi","eggs","green onion"]','["Sauté chopped kimchi in a little oil.","Add cooked rice and stir until piping hot.","Top with a fried egg and sliced green onion."]',20);
