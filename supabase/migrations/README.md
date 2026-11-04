# Database migrations

SQL files here are run **by hand** in the Supabase dashboard → SQL Editor, in filename order
(e.g. `0001_dogs_and_walks.sql`). The coding agent can't reach the database directly.

Feature 1 (auth) needs no SQL: users live in Supabase's built-in `auth.users` table.
Every user-owned table added later must enable row-level security with `user_id = auth.uid()`.
