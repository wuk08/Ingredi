
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 city text,
 impact_points integer not null default 0 check (impact_points >= 0),
 items_shared integer not null default 0 check (items_shared >= 0),
 meals_rescued integer not null default 0 check (meals_rescued >= 0),
 created_at timestamptz not null default now()
);
create table public.pantry_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 name text not null check (length(trim(name)) > 0),
 quantity numeric(10,2) not null default 1 check (quantity > 0),
 unit text not null default 'item',
 expires_on date,
 source text not null default 'manual' check (source in ('manual','receipt')),
 created_at timestamptz not null default now()
);
create index pantry_items_user_id_idx on public.pantry_items(user_id);
create table public.recipes (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text,
 ingredients jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients) = 'array'),
 instructions jsonb not null default '[]'::jsonb check (jsonb_typeof(instructions) = 'array'),
 cook_minutes integer check (cook_minutes > 0),
 created_at timestamptz not null default now()
);
create table public.posts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_type text not null check (post_type in ('available','wanted','meal_prep')),
 category text not null default 'ingredients' check (category in ('ingredients','meals','equipment')),
 title text not null,
 description text,
 quantity numeric(10,2) check (quantity > 0),
 unit text,
 offer_type text not null default 'free' check (offer_type in ('free','exchange')),
 pickup_description text,
 expires_on date,
 status text not null default 'active' check (status in ('active','reserved','completed','cancelled')),
 created_at timestamptz not null default now()
);
create index posts_status_created_idx on public.posts(status,created_at desc);
create index posts_user_id_idx on public.posts(user_id);
create table public.point_transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid references public.posts(id) on delete set null,
 points integer not null check (points <> 0),
 reason text not null,
 created_at timestamptz not null default now()
);
create index point_transactions_user_id_idx on public.point_transactions(user_id);
create table public.receipt_scans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 storage_path text,
 status text not null default 'pending' check (status in ('pending','processed','confirmed','failed')),
 extracted_items jsonb not null default '[]'::jsonb check (jsonb_typeof(extracted_items) = 'array'),
 error_message text,
 created_at timestamptz not null default now()
);
create index receipt_scans_user_id_idx on public.receipt_scans(user_id);
alter table public.profiles enable row level security;
alter table public.pantry_items enable row level security;
alter table public.recipes enable row level security;
alter table public.posts enable row level security;
alter table public.point_transactions enable row level security;
alter table public.receipt_scans enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "pantry select own" on public.pantry_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "pantry insert own" on public.pantry_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "pantry update own" on public.pantry_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "pantry delete own" on public.pantry_items for delete to authenticated using ((select auth.uid()) = user_id);
create policy "recipes readable" on public.recipes for select to authenticated using (true);
create policy "posts readable" on public.posts for select to authenticated using (true);
create policy "posts insert own" on public.posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "posts update own" on public.posts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "posts delete own" on public.posts for delete to authenticated using ((select auth.uid()) = user_id);
create policy "transactions select own" on public.point_transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "scans select own" on public.receipt_scans for select to authenticated using ((select auth.uid()) = user_id);
-- Receipt writes and reward awards are reserved for trusted backend functions.
