# Feature 7 — Dashboard: prompts

## Prompt 1

> Next: feature 7 (Dashboard), same loop. Build /dashboard with: a chart of estimated calories per week (Recharts), plus summary stats: total miles, calories this week, average pace (min/mile), and total walks. Only the logged-in user’s data.
> This PR includes my required dashboard test from PLAN.md section 4: Given a 65 lb dog with two walks this week of 1.0 and 2.0 miles, when the dashboard computes “calories this week,” then it shows 156. Put the stat calculation in a pure function so the test is simple.
> For red → green, I can’t run npm test locally, so do it through CI on the PR: first push the test passing (green), then push a separate commit that deliberately breaks the calculation (red), and after I screenshot it, revert that commit (green again). Tell me when each run is ready to screenshot. Also put a plain-English explanation and a “what would break it” sentence in the PR description.

**Summary:** Opened issue #17 and branched `feature/dashboard`. Added the pure stat functions in `lib/dashboard/stats.ts` (`computeDashboardStats`, `weeklyCalories`, Monday–Sunday weeks, "today" in California time), the PLAN.md Test 2 plus 8 more tests, a `/dashboard` page with four stat tiles and a Recharts weekly-calories bar chart (color checked with the dataviz palette validator, hover tooltip, table view), and a Dashboard nav link with route protection. Checked the chart's look in a temporary local preview page, which was deleted afterwards. Pushed the green commit first for the CI red → green.

## Prompt 2

> red. all three choices confirmed

**Summary:** Pushed a separate commit (`6c9a36d`) that changes `>=` to `>` on the Monday boundary in `computeDashboardStats`. CI went red: `expected 104 to be 156` in PLAN.md Test 2. The three choices were confirmed: Monday–Sunday weeks, California time, and the `#3a7d44` bar color.

## Prompt 3

> revert

**Summary:** Reverted the break with `git revert` (`51d0ab1`) and pushed. CI went green again.
