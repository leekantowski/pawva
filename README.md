# Pawva 🐕

**Live app: [pawva.vercel.app](https://pawva.vercel.app)**

Pawva is a dog-walk log. After each walk you record (or import from your Apple Watch) the date, distance and duration, and Pawva estimates how many calories your dog burned. A weekly dashboard then shows whether the walks are adding up. It was built for Luna, a 65 lb German Shepherd. Apple Watch tracks the human's workout, but nothing was tracking hers.

## What it does

- **Accounts:** sign up and log in with email and password. Each user's dogs, walks and stars are private to them, enforced by the database.
- **Dogs:** add a dog with name, breed and weight (lb).
- **Walks:** log, view, edit and delete walks (date, dog, distance, duration, notes). Every form shows a friendly message next to any field that's wrong.
- **Apple Watch import:** pick GPX files from an Apple Health export (`workout-routes`). The files are read in your browser. A preview table shows the date, distance, duration and pace for each one, and workouts that were already imported are skipped.
- **Stars and search:** star favourite walks. Filter by date range, search notes, and sort by newest, oldest, longest or most calories.
- **Dashboard:**
  - lifetime totals per dog, including estimated steps;
  - current and longest walk streak;
  - a weekly estimated-calories chart;
  - this week's calories, total miles, average pace and total walks.

> **About the numbers:** calories and steps are **rough, weight-based estimates**, always labelled "est.". They aren't measurements and aren't veterinary advice.
> - **Calories** = 0.8 × dog weight (lb) × miles, a commonly cited figure for brisk walking. They're stored on each walk when it's saved.
> - **Steps** = miles ÷ a stride length picked from the dog's weight: 18 in under 25 lb, 28 in for 25–59.9 lb, 36 in for 60 lb and up. One "step" counts one paw's footfall, like a pedometer.

## Built with

| Tool | Used for |
|---|---|
| [Claude Code](https://claude.com/claude-code) | AI coding agent. It built every feature through the issue → branch → PR → review → merge loop described in [`CLAUDE.md`](CLAUDE.md), and logged the prompts in [`prompts/`](prompts/). |
| [Next.js](https://nextjs.org) 16 (App Router) + TypeScript | The web app: pages, Server Actions and route protection. |
| [Supabase](https://supabase.com) | Postgres database, email/password auth, and row-level security. |
| [Vercel](https://vercel.com) | Hosting. There's a preview deployment for every PR, and every merge to `main` redeploys. |
| [GitHub Actions](https://github.com/features/actions) | CI on every PR: unit tests, a build, and data-isolation tests against the real Supabase database. |
| [Recharts](https://recharts.org) | The weekly calories chart. |
| [Vitest](https://vitest.dev) | Unit and integration tests. |

Project docs:
- [`PLAN.md`](PLAN.md): the original plan.
- [`schema.md`](schema.md): the database as built, compared with the plan.
- [`supabase/migrations/`](supabase/migrations/): the SQL that creates it.

## Run it locally

You need **Node.js 22** and a Supabase project.

1. **Clone and install.**
   ```bash
   git clone https://github.com/leekantowski/pawva.git
   ```
   ```bash
   cd pawva
   ```
   ```bash
   npm install
   ```

2. **Set up the database (one time).** In your Supabase project, open **SQL Editor**. Run each file in [`supabase/migrations/`](supabase/migrations/) in order: `0001`, then `0002`, then `0003`.
   - For instant sign-up without email confirmation, also turn off **Authentication → Sign In / Providers → Email → Confirm email**.

3. **Add your environment variables.** Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
   Then fill in these two values from Supabase → **Project Settings → API**:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your project URL, e.g. `https://abcd1234.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **anon / public** key (never the service-role key) |

   `.env.local` is git-ignored. Never commit real keys.

4. **Start the app.** Then open [http://localhost:3000](http://localhost:3000).
   ```bash
   npm run dev
   ```

### Tests

**Unit tests** need no database:
```bash
npm test
```

**Production build:**
```bash
npm run build
```

**Data-isolation tests** run against a real Supabase project, using two test accounts. CI runs them automatically. To run them yourself, see [`tests/integration/README.md`](tests/integration/README.md) for the six environment variables they need, then:
```bash
npm run test:rls
```
