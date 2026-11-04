# Feature 10 — Walk streak: prompts

## Prompt 1

> Merge on the local results. Add a note to the PR description: “Merged with CI still queued (GitHub Actions runner backlog); all 92 tests and the build passed locally.” Then start feature 10.

**Summary:** After merging PR #24 (logged in `prompts/lifetime-steps.md`), asked which feature "feature 10" meant, since PLAN.md's #10 (Treat converter) had just been replaced. The answer was "Walk streak" (PLAN.md #9, the only one not built yet).

## Prompt 2

> Next: feature 10 (Walk streak), same loop. Branch feature/walk-streak. Show the current streak, meaning consecutive days with at least one walk, counted in California time, plus the longest streak ever, as a card on /dashboard. If there’s no walk yet today, the streak still counts through yesterday. Put the logic in a pure function with a few unit tests (including the today/yesterday rule); skip red/green. No new tables. Tell me how to check it on the preview.

**Summary:** Opened issue #25 (story copied verbatim from PLAN.md #9) and branched `feature/walk-streak`. Added `computeStreak(walkDates, today)` in `lib/dashboard/streak.ts` (current streak ending today, or through yesterday if there's no walk yet today; longest streak ever; several walks on one day count once; future dates ignored), a "🔥 Walk streak" card on `/dashboard` with a nudge line, and 8 unit tests (100 total). No database changes. Skipped red → green as asked.

## Prompt 3

> awesome! merge

**Summary:** Added this prompt to the log, checked CI, then merged PR #26 into main and switched back to an up-to-date main.
