-- ⚠️ RED STEP ONLY: makes every star readable by any logged-in user.
-- Run restore-stars-select-policy.sql right after the failing test run.
drop policy "Users can read their own stars" on public.stars;
create policy "Users can read their own stars" on public.stars for select using (true);
