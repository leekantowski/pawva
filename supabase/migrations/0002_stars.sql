-- Feature 5: stars (junction table: "this user starred this walk")
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Requires 0001_dogs_and_walks.sql to have been run first.

create table public.stars (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  walk_id     bigint not null references public.walks (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, walk_id)          -- a user can star a given walk only once
);

create index stars_walk_id_idx on public.stars (walk_id);

alter table public.stars enable row level security;

create policy "Users can read their own stars"
  on public.stars for select
  using (user_id = auth.uid());

-- You can only star your own walks (so nobody can star, or probe for, someone else's walk).
create policy "Users can star their own walks"
  on public.stars for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.walks w where w.id = walk_id and w.user_id = auth.uid())
  );

create policy "Users can unstar their own stars"
  on public.stars for delete
  using (user_id = auth.uid());

-- No update policy on purpose: a star is either there or not, so starring/unstarring
-- is insert/delete. With RLS on and no update policy, updates are blocked for everyone.
