-- Feature 8: Apple Watch GPX upload
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Requires 0001_dogs_and_walks.sql (and 0002_stars.sql) to have been run first.

-- When an imported workout started (the GPX file's first timestamp). Null for manually logged walks.
alter table public.walks add column started_at timestamptz;

-- Skip duplicates: a user can't have two walks with the same start time.
-- Manual walks (started_at is null) are unaffected, because Postgres treats nulls as distinct.
alter table public.walks add constraint walks_user_started_at_key unique (user_id, started_at);

-- Row-level security on walks is unchanged: the existing policies already limit
-- every row (including this new column) to user_id = auth.uid().
