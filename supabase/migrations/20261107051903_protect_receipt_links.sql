-- Receipt linkage is server-controlled, so clients cannot reserve another
-- scan's unique line numbers or relink items after confirmation.
revoke insert, update on public.pantry_items from authenticated;
grant insert(user_id,name,quantity,unit,expires_on,source) on public.pantry_items to authenticated;
grant update(name,quantity,unit,expires_on) on public.pantry_items to authenticated;
