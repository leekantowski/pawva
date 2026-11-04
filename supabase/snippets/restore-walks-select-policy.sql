-- Restores the correct policy from 0001_dogs_and_walks.sql: users can read only their own walks.
drop policy "Users can read their own walks" on public.walks;
create policy "Users can read their own walks" on public.walks for select using (user_id = auth.uid());
