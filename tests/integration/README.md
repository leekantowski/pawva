# Integration tests (real Supabase)

- `walks-rls.test.ts` is PLAN.md §4 Test 1 (data isolation). It logs in as two real users
  against the real Supabase project and checks that row-level security keeps User A's walk
  invisible to User B. No mocks.
- `stars-rls.test.ts` (feature 5) checks that users only see and change their own stars, that a
  walk can be starred once per user, and that the "Starred" query returns only starred walks.

Every migration in `supabase/migrations/` must have been run in Supabase first, or these fail.

It runs in GitHub Actions (`.github/workflows/tests.yml`, job "Data isolation") on every PR,
on pushes to main, and by hand from the Actions tab.

## One-time setup

1. In the app, sign up two test accounts (e.g. `rls-a@example.com` and `rls-b@example.com`).
   Use them only for this test — **User B must never log walks**, because the test expects
   User B's walk list to be empty.
2. In GitHub → repo → Settings → Secrets and variables → Actions → New repository secret, add:

   | Secret | Value |
   |---|---|
   | `SUPABASE_URL` | same as `NEXT_PUBLIC_SUPABASE_URL` |
   | `SUPABASE_ANON_KEY` | same as `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `RLS_TEST_A_EMAIL` / `RLS_TEST_A_PASSWORD` | test account A |
   | `RLS_TEST_B_EMAIL` / `RLS_TEST_B_PASSWORD` | test account B |

   Never add the service-role key: it bypasses RLS.

## Running locally (optional)

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... RLS_TEST_A_EMAIL=... RLS_TEST_A_PASSWORD=... \
RLS_TEST_B_EMAIL=... RLS_TEST_B_PASSWORD=... npm run test:rls
```

If any variable is missing, the test fails on purpose instead of skipping.

## Red → green (walks; for stars use the `*-stars-select-policy.sql` snippets the same way)

1. Green: the job passes.
2. Break: run `supabase/snippets/break-walks-select-policy.sql` in the Supabase SQL Editor.
3. Red: re-run the job — it fails because User B can see User A's walk.
4. Restore immediately: run `supabase/snippets/restore-walks-select-policy.sql`.
5. Green: re-run the job — it passes.
