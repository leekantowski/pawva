# Feature 6 — Find things: prompts

## Prompt 1

> Next: feature 6 (Find things), same loop. On /walks, add: a search box that matches walk notes, a date-range filter (from/to), and a sort dropdown (newest first, oldest first, longest distance, most calories). They should combine with each other and with the Starred tab, and be kept in the URL so a refresh keeps them. No new tables needed. Skip extra red/green steps for this one; just tell me how to check it on the preview.

**Summary:** Opened issue #15 and branched `feature/find-things`. Added `lib/walks/filters.ts` (read and write `?q=&from=&to=&sort=&view=`, sort orders, safe ILIKE pattern), changed `listWalks` to apply search, dates, Starred and sort in one query, and added a filter bar on `/walks` with a result count, "no matches" and "clear" links. Tabs keep the filters. Added 14 unit tests (58 total); tests and build pass. Skipped red → green as asked.

## Prompt 2

> merghe

**Summary:** Read this as "merge". Added this prompt to the log, checked CI on the feature commit, then merged PR #16 into main and switched back to an up-to-date main.
