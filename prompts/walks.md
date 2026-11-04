# Feature 3 — Walk CRUD: prompts

## Prompt 1

> Go on feature 3 (Walk CRUD), same loop. This PR also needs my required data isolation test from PLAN.md section 4: Given User A has logged a walk, when User B logs in and loads the walks list (and requests User A’s walk by ID), then User B sees nothing.
> It needs to test the real Supabase row-level security, not mocks, but you can’t reach my database from your sandbox. Propose how we’ll run it for real (for example, a GitHub Actions workflow using repo secrets I add), and how we’ll do red → green so I can screenshot both. Give me that plan before building.

**Summary:** Proposed the walk pages and three decisions (calorie recalculation on edit, minimal validation until feature 4, pace on cards). Proposed running the isolation test in GitHub Actions against real Supabase with two fixed test accounts stored as repo secrets, and doing red → green by temporarily breaking the walks select policy in the SQL Editor.

## Prompt 2

> all 3 of those sound great. go ahead

**Summary:** Opened issue #9 and branched `feature/walks`. Built the walks list, new, detail, edit, and two-step delete pages; added the real-Supabase isolation test (`npm run test:rls`), a GitHub Actions workflow (unit tests + build, and the RLS test), and SQL snippets to break and restore the policy. Ran the migration and isolation scenario in a throwaway local Postgres to confirm the policies and the snippets behave as expected. Added 12 unit tests (33 total); tests and build pass, and red → green ran on the edit-recalculation rule.
