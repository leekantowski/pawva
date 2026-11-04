# Docs: schema.md and README: prompts

## Prompt 1

> Docs PR, same loop (branch `docs/schema-readme`):
>
> 1. schema.md: every table as actually built, with columns, types, primary keys, and how the tables relate, plus a simple text diagram. Then a “Plan vs. built” section comparing it with PLAN.md section 3: list every difference (e.g., columns added in later features) and which PR added it.
> 2. README.md: what Pawva does, the live URL (pawva.vercel.app), the tools used (Claude Code, Next.js, Supabase, Vercel, GitHub Actions), how to run it locally (env vars, npm install, npm run dev, npm test), and a note that calories and steps are rough weight-based estimates.
>
> Also add “(CI later passed)” to the note on PR #24.

**Summary:** Added "(CI later passed)" to PR #24's note. Opened issue #27 and branched `docs/schema-readme`. Wrote `schema.md` from the three migration files: every table with columns, types, keys, constraints and indexes; relationships plus a text diagram; RLS rules; computed-not-stored values; and a 16-row "Plan vs. built" table, with the PR for each difference. Rewrote `README.md`: what Pawva does, the live URL, tools, local setup (migrations, env vars, npm install / run dev / test), and the estimates note. No code changes; tests and build still pass.
