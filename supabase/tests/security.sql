-- Real database integration tests. ALL fixtures are rolled back, including auth rows.
-- These fixtures simulate JWT claims for RLS tests; they are not login accounts.
begin;
create temp table test_fixture as select gen_random_uuid() a,gen_random_uuid() b,gen_random_uuid() scan_a,gen_random_uuid() scan_b;
grant select on test_fixture to authenticated;
create temp table test_results (name text,passed boolean);
grant insert,select on test_results to authenticated;
insert into auth.users(id,email,aud,role)
select a,'fixture-a-'||a::text||'@example.invalid','authenticated','authenticated' from test_fixture
union all select b,'fixture-b-'||b::text||'@example.invalid','authenticated','authenticated' from test_fixture;
insert into public.profiles(id) select a from test_fixture union all select b from test_fixture;
insert into public.receipt_scans(id,user_id,status) select scan_a,a,'processed' from test_fixture union all select scan_b,b,'processed' from test_fixture;
insert into public.pantry_items(user_id,name) select b,'Private pears' from test_fixture;
insert into public.point_transactions(user_id,points,reason) select b,50,'test fixture' from test_fixture;
select set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated')::text,true) from test_fixture;
set local role authenticated;
do $$
declare n integer; x jsonb; y jsonb; sid uuid;
begin
  if exists(select 1 from public.pantry_items where user_id=(select b from test_fixture)) then raise exception 'Cross-user pantry read'; end if;
  if exists(select 1 from public.receipt_scans where user_id=(select b from test_fixture)) then raise exception 'Cross-user scan read'; end if;
  if exists(select 1 from public.point_transactions where user_id=(select b from test_fixture)) then raise exception 'Cross-user points read'; end if;
  insert into test_results values ('cross-user reads blocked',true);
  update public.pantry_items set name='Hacked' where user_id=(select b from test_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Cross-user pantry update'; end if;
  begin
    insert into public.pantry_items(user_id,name) select b,'Hacked' from test_fixture;
    raise exception 'Cross-user insert was allowed';
  exception when insufficient_privilege then null; end;
  insert into test_results values ('cross-user writes blocked',true);
  begin
    update public.profiles set impact_points=999 where id=(select a from test_fixture);
    raise exception 'Counter update was allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.profiles(id,impact_points) select a,999 from test_fixture;
    raise exception 'Counter insert was allowed';
  exception when insufficient_privilege then null; end;
  insert into test_results values ('reward counter forgery blocked on insert and update',true);
  update public.profiles set display_name='Allowed' where id=(select a from test_fixture);
  get diagnostics n=row_count; if n<>1 then raise exception 'Profile name edit broken'; end if;
  insert into test_results values ('allowed profile field remains editable',true);
  begin
    insert into public.receipt_scans(user_id) select a from test_fixture;
    raise exception 'Client scan write was allowed';
  exception when insufficient_privilege then null; end;
  insert into test_results values ('client scan writes blocked',true);
  begin
    insert into public.pantry_items(user_id,name,receipt_scan_id,receipt_line) select a,'Forged receipt link',scan_b,0 from test_fixture;
    raise exception 'Receipt linkage forgery was allowed';
  exception when insufficient_privilege then null; end;
  insert into test_results values ('client receipt linkage forgery blocked',true);
  begin
    perform public.confirm_receipt((select scan_b from test_fixture),'[{"name":"Stolen","quantity":1,"unit":"item"}]');
    raise exception 'Cross-user confirm was allowed';
  exception when insufficient_privilege then null; end;
  insert into test_results values ('cross-user confirm blocked',true);
  sid := (select scan_a from test_fixture);
  begin
    perform public.confirm_receipt(sid,'[{"name":"First","quantity":1,"unit":"item"},{"name":"Bad","quantity":-1,"unit":"item"}]');
    raise exception 'Invalid payload was allowed';
  exception when raise_exception then
    if sqlerrm='Invalid payload was allowed' then raise; end if;
  end;
  if exists(select 1 from public.pantry_items where receipt_scan_id=sid) then raise exception 'Partial confirmation committed'; end if;
  if (select status from public.receipt_scans where id=sid)<>'processed' then raise exception 'Invalid confirm changed status'; end if;
  insert into test_results values ('malformed confirmation rolls back every item',true);
  x := public.confirm_receipt(sid,'[{"name":"Milk","quantity":1.5,"unit":"gal","expires_on":"2026-11-09"},{"name":"Eggs","quantity":12,"unit":"item"}]');
  y := public.confirm_receipt(sid,'[{"name":"Duplicate","quantity":1,"unit":"item"}]');
  if (x->>'count')::integer<>2 or (y->>'already_confirmed')::boolean<>true or x->'item_ids'<>y->'item_ids' then raise exception 'Idempotency broken'; end if;
  if (select count(*) from public.pantry_items where receipt_scan_id=sid)<>2 then raise exception 'Duplicate pantry rows'; end if;
  if (select status from public.receipt_scans where id=sid)<>'confirmed' then raise exception 'Scan status not committed'; end if;
  insert into test_results values ('confirmed pantry persists with correct scan status',true),('confirmation replay returns same ids without duplicates',true);
end;
$$;
reset role;
select json_build_object('tests',json_agg(test_results),'all_passed',bool_and(passed)) from test_results;
rollback;
