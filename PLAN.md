# PLAN.md — Luna Miles 🐕

> Working name; rename freely.

## 1. Pitch

I'm building **Luna Miles**, a dog-walk log that turns my walk data into an estimate of how many calories my 65 lb German Shepherd, Luna, burned. I want to know whether her walks are actually doing anything for her fitness. Apple Watch tracks *my* workout, but nothing tracks hers. I'll use it **after every walk (about daily)** and check the dashboard weekly.

## 2. Features (user stories, in build order)

**Spine**

1. **Sign up / login / logout.** As a dog owner, I want to create an account with my email and password and log in and out, so that my walks are private to me.
2. **Data model: dogs + walks.** As a dog owner, I want to add my dog with a name, breed, and weight (lb), so that every walk I log is tied to her and her calories can be estimated.
3. **Walk CRUD.** As a dog owner, I want to log a walk with date, dog, distance (miles), duration (minutes), and optional notes, then view my list of walks, open one walk's detail page, edit it, and delete it after an "Are you sure?" confirmation, so that my log stays accurate.
4. **Validation.** As a dog owner, I want a friendly message if I leave date, dog, distance, or duration blank (or enter a distance/duration ≤ 0), so that I don't save broken walks.
5. **Stars.** As a dog owner, I want to star a walk and see a "Starred" view, so that I can find favorite routes and big days again.
6. **Find things.** As a dog owner, I want to filter walks by date range and search notes, and sort by newest, longest distance, or most calories, so that I can find specific walks quickly.
7. **Dashboard.** As a dog owner, I want a chart of Luna's estimated calories per week plus summary stats (total miles, calories this week, average pace in min/mile, and total walks), so that I can see her activity trend at a glance.

**My 3 features**

8. **Apple Watch GPX upload.** As a dog owner, I want to upload a GPX route file from my Apple Health export and have the app fill in date, distance, and duration automatically, so that I don't retype what my watch already recorded.
9. **Walk streak.** As a dog owner, I want to see how many consecutive days Luna has been walked, so that I stay consistent.
10. **Treat converter.** As a dog owner, I want each walk and the dashboard to show calories burned as "treat equivalents" (e.g., 1 treat = 25 cal), so that the numbers mean something to me.

**Calorie formula** (estimate, shown as "est." in the UI): `calories = 0.8 × dog weight (lb) × distance (miles)`, based on the commonly cited ~0.8 cal/lb/mile figure for brisk walking. For Luna, that's ~52 cal/mile.

## 3. Database

| Table | Column | Type | Notes |
|---|---|---|---|
| **users** | id | text (uuid) | PK. Managed by Supabase Auth (`auth.users`) |
| | email | text | unique, required |
| | created_at | date/time | |
| **dogs** | id | number | PK |
| | user_id | text (uuid) | FK → users.id |
| | name | text | required |
| | breed | text | optional |
| | weight_lb | number | required, > 0 |
| | created_at | date/time | |
| **walks** | id | number | PK |
| | user_id | text (uuid) | FK → users.id |
| | dog_id | number | FK → dogs.id |
| | walked_on | date | required |
| | distance_mi | number | required, > 0 |
| | duration_min | number | required, > 0 |
| | calories_est | number | computed on save from the dog's weight *at that time* |
| | notes | text | optional |
| | source | text | "manual" or "gpx" |
| | created_at | date/time | |
| **stars** | id | number | PK |
| | user_id | text (uuid) | FK → users.id |
| | walk_id | number | FK → walks.id |
| | created_at | date/time | unique (user_id, walk_id) |

**Relationships**
- users → dogs: one-to-many (one user has many dogs)
- dogs → walks: one-to-many (one dog has many walks)
- users ↔ walks via **stars**: many-to-many junction table ("this user starred this walk")

```
users ──< dogs ──< walks
  │                  │
  └──────< stars >───┘
```

**Design decision:** `calories_est` is stored on each walk, not recalculated live. If Luna's weight changes later, old walks keep the estimate from when they happened.

**Privacy:** Supabase row-level security on dogs, walks, and stars lets a user read and write only rows where `user_id = auth.uid()`.

## 4. Tests

1. **Data isolation.** *Given* User A has logged a 2.0-mile walk with Luna, *when* User B logs in and loads the walks list (and requests User A's walk by ID), *then* User B sees zero walks and the direct request returns nothing.
2. **Dashboard stat.** *Given* a 65 lb dog with two walks this week of 1.0 and 2.0 miles, *when* the dashboard computes "calories this week," *then* it shows 156 (0.8 × 65 × 3.0).

## 5. Technologies

- **Coding agent: Claude Code.** It can run the whole Issue → branch → PR → merge loop through the GitHub CLI, which keeps commits off main.
- **Framework: Next.js (React).** It's the most common full-stack setup, so the agent knows it well, and Vercel deploys it natively.
- **Database: Supabase (Postgres).** A real relational database with foreign keys, and row-level security enforces data isolation at the database level.
- **Sign up / login: Supabase Auth (email + password, email confirmation off).** Accounts are created inside the app, and the live demo sign-up works instantly.
- **Hosting: Vercel.** Every merge to main redeploys automatically, so the live URL stays current.
- **Libraries:** Recharts for the dashboard chart (simple React charts); a small GPX parser (e.g., `gpxparser`) or hand-rolled XML parsing plus a haversine distance calculation for uploads; Vitest for tests (fast and simple).

## 6. Design

- **Feel:** outdoorsy and warm, clean, mobile-first, because I'll log walks on my phone right after walking.
- **Colors:** forest green (primary), warm sand/cream background, shepherd tan + charcoal accents.
- **Inspiration:** Strava's activity feed (walk cards with distance, time, and pace) and Apple Fitness summary cards (big bold stat numbers).

## 7. Risks and cuts

- **Least sure I can build:** #8, the GPX upload. Apple's export format may be messy, and the distance has to be computed from GPS points.
- **Cut first if I run out of time:** #8. I'd replace it with something low-risk (dark mode or a "random past walk" button) so I still ship 3 working features of my own.

---

## Plan vs. Reality

> Fill in at the end. Don't edit the plan above.

| Planned feature | Shipped / Changed / Cut | Status (Done/Backlogged) | Learning | What changed and why (one line) |
|---|---|---|---|---|
| 1. Sign up / login | | | | |
| 2. Data model | | | | |
| 3. Walk CRUD | | | | |
| 4. Validation | | | | |
| 5. Stars | | | | |
| 6. Find things | | | | |
| 7. Dashboard | | | | |
| 8. GPX upload | | | | |
| 9. Walk streak | | | | |
| 10. Treat converter | | | | |
