# Instructions for the coding agent

This is a class project graded on process. Follow these rules for every feature.

## The feature loop (mandatory)

1. **Never commit to `main`.** All changes reach main through a pull request.
2. For each feature, I'll name a feature number from PLAN.md. Then:
   - Open a GitHub Issue with `gh issue create`. Title = the feature name; body = the user story copied verbatim from PLAN.md.
   - Create a branch from an up-to-date main: `feature/<short-name>`.
   - Build ONLY that feature. Keep the PR small.
   - Save my prompts for this feature **verbatim** to `prompts/<short-name>.md`, plus a one-line summary of what you did after each. Do this on the same branch.
   - Run the tests and make sure the app builds before opening the PR.
   - Open the PR with `gh pr create`. The description includes what changed, how I can verify it, and `closes #<issue number>`.
   - **Stop and wait for me to check it before merging.** When I say merge, merge with `gh pr merge` and switch back to an updated main.
3. If you deviate from PLAN.md (a different schema, a skipped piece, a changed approach), **tell me explicitly before doing it.** Never edit PLAN.md's original sections.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Supabase: Postgres + Auth (email/password). Use row-level security on every user-owned table (`user_id = auth.uid()`).
- Recharts for charts; Vitest for tests
- Calorie estimate: `0.8 × dog weight_lb × distance_mi`, stored on the walk when it's saved

## Tests

When adding a test, also give me a plain-English explanation, and help me do red → green: temporarily break the feature, run the test (fails), revert, run it again (passes), so I can screenshot both.
