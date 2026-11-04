# Feature 3 — Walk CRUD: prompts

## Prompt 1

> Go on feature 3 (Walk CRUD), same loop. This PR also needs my required data isolation test from PLAN.md section 4: Given User A has logged a walk, when User B logs in and loads the walks list (and requests User A’s walk by ID), then User B sees nothing.
> It needs to test the real Supabase row-level security, not mocks, but you can’t reach my database from your sandbox. Propose how we’ll run it for real (for example, a GitHub Actions workflow using repo secrets I add), and how we’ll do red → green so I can screenshot both. Give me that plan before building.

**Summary:** Proposed the walk pages and three decisions (calorie recalculation on edit, minimal validation until feature 4, pace on cards). Proposed running the isolation test in GitHub Actions against real Supabase with two fixed test accounts stored as repo secrets, and doing red → green by temporarily breaking the walks select policy in the SQL Editor.

## Prompt 2

> all 3 of those sound great. go ahead

**Summary:** Opened issue #9 and branched `feature/walks`. Built the walks list, new, detail, edit, and two-step delete pages; added the real-Supabase isolation test (`npm run test:rls`), a GitHub Actions workflow (unit tests + build, and the RLS test), and SQL snippets to break and restore the policy. Ran the migration and isolation scenario in a throwaway local Postgres to confirm the policies and the snippets behave as expected. Added 12 unit tests (33 total); tests and build pass, and red → green ran on the edit-recalculation rule.

## Prompt 3

> List exactly which GitHub secrets to add and where to find each value

**Summary:** Listed the six repository secrets (Supabase URL and anon key, plus email and password for two test accounts), where to find each value in Supabase or Vercel, and how to create the test accounts. Warned never to add the service-role key.

## Prompt 4

> ok that part is green

**Summary:** Checked the Actions log to confirm the green run was real (all 6 data isolation checks passed against Supabase), then gave the break → red → restore → green steps.

## Prompt 5

> Add a plain-English explanation of the data isolation test and a ‘what would break it’ sentence to the PR description, then merge.

**Summary:** Added this prompt log, added the plain-English explanation and the "what would break it" sentence to the PR description, waited for the checks on the latest commit to pass, then merged PR #10 and switched back to an up-to-date main.
