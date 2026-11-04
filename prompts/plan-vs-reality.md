# Docs: Plan vs. Reality: prompts

## Prompt 1

> Next: add the Plan vs. Reality table to the bottom of PLAN.md in its own PR (same loop). Don’t touch the original sections. Use the assignment’s columns: Planned feature | Shipped / Changed / Cut | Status (Done/Backlogged) | Learning | What changed and why (one line). Fill everything from the table you gave me, include rows for “Edit dog (Backlogged)” and the “Luna Miles → Pawva” rename, and leave the Learning column empty; I’ll fill it in.

**Summary:** PLAN.md already ended with an empty "Plan vs. Reality" template using exactly these columns, so I filled in its 10 rows and added "Edit dog" (Cut / Backlogged) and "App name: Luna Miles → Pawva" (Changed / Done). Each row links its PR, and the Learning column is left empty. Checked that lines 1–104 (every original section plus the table header) are byte-for-byte unchanged. Where you hadn't given a reason (treat converter swap, edit dog), the wording says "owner's choice" instead of inventing one. Opened issue #29, branch `docs/plan-vs-reality`.
