-- Feature 2: dogs + walks
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Users come from Supabase's built-in auth.users table (no public users table).

-- ───────────── dogs ─────────────
create table public.dogs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  breed       text,
  weight_lb   numeric(6, 2) not null check (weight_lb > 0),
  created_at  timestamptz not null default now()
);

create index dogs_user_id_idx on public.dogs (user_id);

alter table public.dogs enable row level security;

create policy "Users can read their own dogs"
  on public.dogs for select
  using (user_id = auth.uid());

create policy "Users can add their own dogs"
  on public.dogs for insert
  with check (user_id = auth.uid());

create policy "Users can update their own dogs"
  on public.dogs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own dogs"
  on public.dogs for delete
  using (user_id = auth.uid());

-- ───────────── walks ─────────────
create table public.walks (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id        bigint not null references public.dogs (id) on delete cascade,
  walked_on     date not null,
  distance_mi   numeric(6, 2) not null check (distance_mi > 0),
  duration_min  numeric(6, 1) not null check (duration_min > 0),
  calories_est  numeric(8, 1) not null check (calories_est >= 0),  -- 0.8 × dog weight_lb × distance_mi, set on save
  notes         text,
  source        text not null default 'manual' check (source in ('manual', 'gpx')),
  created_at    timestamptz not null default now()
);

create index walks_user_walked_on_idx on public.walks (user_id, walked_on desc);
create index walks_dog_id_idx on public.walks (dog_id);

alter table public.walks enable row level security;

create policy "Users can read their own walks"
  on public.walks for select
  using (user_id = auth.uid());

-- Insert/update also require the walk's dog to belong to the same user,
-- so nobody can attach a walk to someone else's dog.
create policy "Users can add walks for their own dogs"
  on public.walks for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.dogs d where d.id = dog_id and d.user_id = auth.uid())
  );

create policy "Users can update their own walks"
  on public.walks for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.dogs d where d.id = dog_id and d.user_id = auth.uid())
  );

create policy "Users can delete their own walks"
  on public.walks for delete
  using (user_id = auth.uid());
