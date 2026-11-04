# Feature 5 — Stars: prompts

## Prompt 1

> Next: feature 5 (Stars), same loop. Use one stars junction table as in PLAN.md (user_id, walk_id, unique per pair) with row-level security so users only see and change their own stars. Add a star toggle on the walks list and the walk detail page, plus a “Starred” view showing only my starred walks. Give me the SQL to run in Supabase.

**Summary:** Opened issue #13 and branched `feature/stars`. Wrote `supabase/migrations/0002_stars.sql`: a stars table with one star per user per walk, row-level security for reading, starring and unstarring your own stars, and starring only your own walks. Added a star toggle that flips instantly on the walks list and the detail page, and a "★ Starred" view at `/walks?view=starred`. Added a real-Supabase stars privacy test and break/restore snippets. Confirmed the policies in a throwaway local Postgres. Tests: 44 unit tests pass; red → green on the starred-view parsing.
