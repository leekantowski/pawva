-- Restores the correct policy from 0002_stars.sql: users can read only their own stars.
drop policy "Users can read their own stars" on public.stars;
create policy "Users can read their own stars" on public.stars for select using (user_id = auth.uid());
