# Feature 1 — Sign up / login / logout: prompts

## Prompt 1

> Read CLAUDE.md and PLAN.md. Build feature 1 (Sign up / login / logout) following the feature loop in CLAUDE.md, including scaffolding the Next.js + Supabase app on this branch. The scaffold goes through this feature's branch and PR, not straight to main.
>
> Constraints:
> - Read the Supabase config from env vars named exactly NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (already set in Vercel). Never commit keys.
> - You can't reach my Supabase database directly. Put any database SQL in supabase/migrations/ and tell me exactly what to paste into the Supabase SQL Editor.
> - If you can't create GitHub issues yourself, tell me and I'll create them on GitHub.
>
> Before writing code, give me your plan for the files and the auth flow.

**Summary:** Read both files and proposed a file layout and auth flow (Supabase SSR cookies, Server Actions, route protection, Vitest tests). Flagged the deviations: branch name, GitHub connector instead of `gh`, and no SQL needed for this feature.

## Prompt 2

> Go. Two notes: (1) Please try pushing to a branch named feature/auth, since my class requires feature-named branches. If the session blocks it, use your branch and tell me, and I’ll rename it on GitHub. (2) “Confirm email” is already turned off in Supabase.

**Summary:** Opened issue #3, branched `feature/auth` from main, scaffolded Next.js 16 + TypeScript + Supabase SSR, built sign-up/login/logout with route protection in `proxy.ts`, added 11 Vitest tests, and verified that tests and the production build pass.

## Prompt 3

> merge

**Summary:** Added this prompt to the log, then merged PR #4 into main with a merge commit and switched back to an up-to-date main.
