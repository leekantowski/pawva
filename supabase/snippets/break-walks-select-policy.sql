-- ⚠️ RED STEP ONLY: makes every walk readable by any logged-in user.
-- Run restore-walks-select-policy.sql right after the failing test run.
drop policy "Users can read their own walks" on public.walks;
create policy "Users can read their own walks" on public.walks for select using (true);
