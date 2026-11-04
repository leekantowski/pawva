# Fix: "Log a walk" as the primary action: prompts

## Prompt 1

> Stranger test fix, same loop (branch fix/primary-action): my tester, using a phone, tapped “Import from Apple Watch” when she meant to log a walk, because the import button was more prominent than “Log a walk.” Make “Log a walk” the clear primary action on /walks (and anywhere else both appear): bigger, primary color, first in order. Make import a secondary or smaller link. Check that it looks right at phone width. Keep it to this one problem, and include a before/after description in the PR.

**Summary:** Opened issue #31 and branched `fix/primary-action`. Confirmed that /walks is the only page showing both actions. At phone width (iPhone 13), the old header put the outlined "Import from Apple Watch" button on top, at 234 px wide, against 133 px for "+ Log a walk". The fix makes "+ Log a walk" first, larger (`btn-lg`) and full-width on phones, and turns import into a small underlined text link below it (beside it on desktop). Checked before/after screenshots at phone and desktop width using a temporary copy of the header (deleted). Two files changed; 100 tests and the build pass.
