# Feature 4 — Validation: prompts

## Prompt 1

> Next: feature 4 (Validation), same loop. Some walk-form validation already landed in feature 3. For this PR, make validation consistent and friendly across every form (add/edit dog, add/edit walk, sign up, log in): required fields can’t be blank, numbers must be > 0, and each field shows a clear inline message next to it, with the user’s other input preserved. Also validate on the server, not just in the browser. List what was already there vs. what this PR adds in the PR description.

**Summary:** Pointed out that no edit-dog form exists and asked whether to add one; the answer was "Skip it". Opened issue #11 and branched `feature/validation`. Added shared validation rules (`lib/validation.ts`) and per-field validators for sign up, log in, dog and walk. The same validator runs in the browser before submit and again in each Server Action. Every field now shows its own inline message and the user's input is kept. Checked in a real browser with JavaScript on and off (off proves the server validates on its own). Tests: 40 pass; red → green on the shared "> 0" rule.

## Prompt 2

> merge

**Summary:** Added this prompt to the log, checked that the tests passed on the latest commit, then merged PR #12 into main and switched back to an up-to-date main.
