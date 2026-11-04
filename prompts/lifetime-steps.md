# Feature 9 — Lifetime totals + estimated dog steps: prompts

## Prompt 1

> Next: feature 9 (Lifetime totals + estimated dog steps), same loop. Branch `feature/lifetime-steps`. This replaces the “treat converter” feature in PLAN.md; I’ll note the change in Plan vs. Reality.
>
> * Estimated steps = distance ÷ a default stride length based on the dog’s weight: small, medium or large buckets (you propose the cutoffs and stride lengths, and explain the reasoning in the PR). Count one paw’s footfalls, like a pedometer. No new database columns.
> * Show estimated steps on each walk’s detail page, labeled “est.”
> * At the top of /dashboard, add a lifetime totals card using the dog’s name (“Luna’s lifetime totals”): total miles, total estimated calories, total estimated steps, and total walks.
> * Put the steps math in a pure function with a couple of unit tests; skip red/green steps. Tell me how to check it on the preview.

**Summary:** Noted that PLAN.md numbers the treat converter as feature 10 (feature 9 is the walk streak) and built this as its replacement. Opened issue #23 and branched `feature/lifetime-steps`. Added `lib/steps.ts` (small < 25 lb → 18 in stride, medium 25–59.9 lb → 28 in, large ≥ 60 lb → 36 in; steps = miles × 63,360 ÷ stride), a "Steps (est.)" tile on the walk detail page, and a "Luna’s lifetime totals" card (miles, estimated calories, estimated steps, walks) at the top of `/dashboard`, one card per dog. No database changes. Added 6 unit tests (92 total); checked the card in a temporary local page, which was deleted. Skipped red → green as asked.
