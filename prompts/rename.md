# Rename to Pawva (package name): prompts

## Prompt 1

> Small change, same loop (issue → branch feature/rename-pawva → PR → wait for me): rename the app from “Luna Miles” to “Pawva” everywhere it shows up: page titles, header, landing page, browser tab title, and the name in package.json (to pawva). Don’t edit the original sections of PLAN.md. Log the prompt in prompts/rename.md.

**Summary:** Found that the page titles, header, landing page and browser tab title were already "Pawva" (renamed in PR #6), so the only thing left was the package name. Opened issue #19, restarted `feature/rename-pawva` from current main (its earlier PR was already merged, so the push is a normal fast-forward), and renamed `luna-miles` → `pawva` in `package.json` and `package-lock.json`. Left PLAN.md alone. Tests and build pass.
