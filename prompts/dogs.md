# Feature 2 — Data model: dogs + walks: prompts

## Prompt 1

> ok start feature 2 using a similar loop

**Summary:** Opened issue #7 and branched `feature/dogs` from main. Wrote `supabase/migrations/0001_dogs_and_walks.sql` (dogs + walks tables with checks and row-level security, including a rule that a walk's dog must be yours), added the calorie helper and dog validation, and built a `/dogs` page to list and add dogs (now protected and linked in the header). Added 10 tests (21 total), confirmed tests and build pass, and ran red → green on the calorie formula.
