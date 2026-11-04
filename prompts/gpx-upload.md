# Feature 8 — Apple Watch GPX upload: prompts

## Prompt 1

> Next: feature 8 (Apple Watch GPX upload), same loop. Branch `feature/gpx-upload`.
>
> * On /walks, add an “Import from Apple Watch” page where I can pick multiple GPX files at once. They come from the `workout-routes` folder of an Apple Health export.
> * Parse the files in the browser, not on the server. Some are large, and only the summary numbers need to be sent. For each file, compute the date (from the first point, in California time), the distance in miles (from the GPS points), and the duration in minutes (first to last timestamp).
> * Show a preview table before saving: date, start time, distance, duration and pace, each with a checkbox. GPX files don’t say whether a workout was a walk or a run, so I’ll untick the ones that weren’t dog walks. Add a dog dropdown, defaulting to my first dog.
> * Skip duplicates: store each walk’s start time, and don’t import a file whose start time already exists for that user. Show “already imported” in the preview.
> * Saved walks get `source = "gpx"`, and calories are calculated with the same formula as manual walks.
> * If a file can’t be read, show a friendly error for that file and keep going with the others.
> * Give me the SQL to run if the walks table needs a new column. Add unit tests for the distance and duration math, but skip red/green steps for this one. Tell me how to check it on the preview.

**Summary:** Opened issue #21 and branched `feature/gpx-upload`. Added `supabase/migrations/0003_walk_started_at.sql` (a `started_at` column plus a unique (user_id, started_at) rule), browser-side GPX parsing in `lib/gpx/parse.ts` (haversine distance, first-to-last duration, California date and start time; 100k points parse in about 0.2 s), preview logic in `lib/gpx/preview.ts` (ready / already imported / same workout twice / unusable / unreadable), a `/walks/import` page with a checkbox preview table and dog dropdown, and an `importGpxWalks` Server Action that re-checks every row, computes calories with the same formula, saves `source = "gpx"`, and skips duplicates in the database. Added 18 unit tests (86 total). Checked the importer in a real browser with sample files (temporary page, not committed) and checked the SQL in a throwaway local Postgres. Skipped red → green as asked.
