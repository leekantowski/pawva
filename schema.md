# Pawva database schema (as built)

Supabase Postgres. The tables are created by the SQL files in [`supabase/migrations/`](supabase/migrations/), run in order in the Supabase SQL Editor:

| File | Creates / changes | PR |
|---|---|---|
| `0001_dogs_and_walks.sql` | `dogs`, `walks` (+ row-level security) | [#8](https://github.com/leekantowski/pawva/pull/8) |
| `0002_stars.sql` | `stars` (+ row-level security) | [#14](https://github.com/leekantowski/pawva/pull/14) |
| `0003_walk_started_at.sql` | adds `walks.started_at` and a unique (user_id, started_at) rule | [#22](https://github.com/leekantowski/pawva/pull/22) |

## Tables

### `auth.users`: managed by Supabase Auth
There is no `public.users` table. Accounts live in Supabase's built-in `auth.users` table (email + password sign-up, [#4](https://github.com/leekantowski/pawva/pull/4)). The app only references its `id`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | **PK**. Every other table's `user_id` points here. |
| `email` | `text` | Unique, managed by Supabase Auth |
| `created_at` | `timestamptz` | Managed by Supabase Auth |

### `public.dogs`
| Column | Type | Null? | Default | Notes |
|---|---|---|---|---|
| `id` | `bigint` (identity) | no | generated | **PK** |
| `user_id` | `uuid` | no | `auth.uid()` | **FK** → `auth.users.id`, on delete cascade |
| `name` | `text` | no | | Must not be blank |
| `breed` | `text` | yes | | Optional |
| `weight_lb` | `numeric(6,2)` | no | | Must be > 0 |
| `created_at` | `timestamptz` | no | `now()` | |

Index: `dogs_user_id_idx (user_id)`.

### `public.walks`
| Column | Type | Null? | Default | Notes |
|---|---|---|---|---|
| `id` | `bigint` (identity) | no | generated | **PK** |
| `user_id` | `uuid` | no | `auth.uid()` | **FK** → `auth.users.id`, on delete cascade |
| `dog_id` | `bigint` | no | | **FK** → `dogs.id`, on delete cascade |
| `walked_on` | `date` | no | | California date of the walk |
| `distance_mi` | `numeric(6,2)` | no | | Must be > 0 |
| `duration_min` | `numeric(6,1)` | no | | Must be > 0 |
| `calories_est` | `numeric(8,1)` | no | | Must be ≥ 0. Set by the app on save: 0.8 × dog weight (lb) × miles |
| `notes` | `text` | yes | | Optional; searchable on `/walks` |
| `source` | `text` | no | `'manual'` | Must be `'manual'` or `'gpx'` |
| `started_at` | `timestamptz` | yes | | Start time of an Apple Watch import (first GPX timestamp); null for manual walks |
| `created_at` | `timestamptz` | no | `now()` | |

Constraints and indexes:
- `unique (user_id, started_at)`, named `walks_user_started_at_key`. The same imported workout can't be saved twice. Manual walks (`started_at` null) never clash, because Postgres treats nulls as distinct.
- `walks_user_walked_on_idx (user_id, walked_on desc)` and `walks_dog_id_idx (dog_id)`.

### `public.stars`: junction table ("this user starred this walk")
| Column | Type | Null? | Default | Notes |
|---|---|---|---|---|
| `id` | `bigint` (identity) | no | generated | **PK** |
| `user_id` | `uuid` | no | `auth.uid()` | **FK** → `auth.users.id`, on delete cascade |
| `walk_id` | `bigint` | no | | **FK** → `walks.id`, on delete cascade |
| `created_at` | `timestamptz` | no | `now()` | |

Constraints and indexes: `unique (user_id, walk_id)` (one star per user per walk) and `stars_walk_id_idx (walk_id)`.

## Relationships

- **users → dogs**: one-to-many. One user has many dogs.
- **dogs → walks**: one-to-many. One dog has many walks. Each walk also stores `user_id` directly, so row-level security can check ownership without a join.
- **users ↔ walks via stars**: many-to-many through the `stars` junction table.
- **Deletes cascade**: deleting a user removes their dogs, walks and stars; deleting a dog removes its walks; deleting a walk removes its stars.

```
                         auth.users
                          (id PK)
           ┌─────────────────┼──────────────────┐
           │ 1               │ 1                │ 1
           ▼ many            ▼ many             ▼ many
     ┌────────────┐ 1   ┌──────────────┐ 1   ┌─────────────────────┐
     │ dogs       │────►│ walks        │────►│ stars               │
     │ id PK      │many │ id PK        │many │ id PK               │
     │ user_id FK │     │ user_id FK   │     │ user_id FK          │
     │ name       │     │ dog_id FK    │     │ walk_id FK          │
     │ breed      │     │ walked_on    │     │ unique(user_id,     │
     │ weight_lb  │     │ distance_mi  │     │        walk_id)     │
     └────────────┘     │ duration_min │     └─────────────────────┘
                        │ calories_est │
                        │ source       │
                        │ started_at   │
                        │ notes        │
                        └──────────────┘
```

## Row-level security

RLS is enabled on `dogs`, `walks` and `stars`. Every policy limits rows to `user_id = auth.uid()`:

| Table | select | insert | update | delete |
|---|---|---|---|---|
| `dogs` | own rows | own rows | own rows | own rows |
| `walks` | own rows | own rows **and the dog must be yours** | own rows **and the dog must be yours** | own rows |
| `stars` | own rows | own rows **and the walk must be yours** | *no policy (blocked)* | own rows |

The extra "must be yours" checks stop anyone attaching a walk to another user's dog, or starring another user's walk. Two integration tests check these rules against the real database in GitHub Actions: `tests/integration/walks-rls.test.ts` (PLAN.md §4 Test 1) and `tests/integration/stars-rls.test.ts`.

## Computed, not stored

These are calculated when a page loads, from the columns above. There is no column for them:

| Value | How | PR |
|---|---|---|
| Pace (min/mi) | `duration_min ÷ distance_mi` | [#10](https://github.com/leekantowski/pawva/pull/10) |
| Weekly calories, calories this week, total miles, average pace, total walks | Sums over `walks` (weeks run Monday–Sunday, California time) | [#18](https://github.com/leekantowski/pawva/pull/18) |
| Estimated steps | `distance_mi × 63,360 ÷ stride`, with the stride (18 / 28 / 36 in) chosen from the dog's **current** weight | [#24](https://github.com/leekantowski/pawva/pull/24) |
| Lifetime totals per dog | Sums over that dog's walks | [#24](https://github.com/leekantowski/pawva/pull/24) |
| Current and longest walk streak | Consecutive `walked_on` days (California time) | [#26](https://github.com/leekantowski/pawva/pull/26) |

## Plan vs. built

How the built schema differs from PLAN.md §3 (Database). PLAN.md itself is left unchanged.

| # | PLAN.md §3 said | As built | Why | PR |
|---|---|---|---|---|
| 1 | A `users` table with `id`, `email`, `created_at` | No `public.users` table; Supabase's built-in `auth.users` holds accounts (it has those columns) | Supabase Auth already manages users; a copy would duplicate data | [#4](https://github.com/leekantowski/pawva/pull/4), [#8](https://github.com/leekantowski/pawva/pull/8) |
| 2 | `id` columns are "number" | `bigint generated always as identity` | Postgres type for an auto-numbered key | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 3 | `user_id` is "text (uuid)" | `uuid`, defaulting to `auth.uid()` | Matches the type of `auth.users.id` | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 4 | `created_at` is "date/time" | `timestamptz not null default now()` | Postgres timestamp with time zone, filled in automatically | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 5 | `weight_lb`, `distance_mi`, `duration_min`, `calories_est` are "number" | `numeric` with fixed precision: (6,2), (6,2), (6,1), (8,1) | Exact decimals, sized for realistic values | [#8](https://github.com/leekantowski/pawva/pull/8) |
| 6 | Rules: name required, weight > 0, distance > 0, duration > 0 | Same, enforced as database `check` constraints; name also can't be blank; `calories_est ≥ 0` | Database rejects bad data even if the app's checks are bypassed | [#8](https://github.com/leekantowski/pawva/pull/8) |
| 7 | `source` is "manual" or "gpx" | `check (source in ('manual','gpx'))`, default `'manual'` | Enforced in the database | [#8](https://github.com/leekantowski/pawva/pull/8) |
| 8 | FKs `user_id → users.id`, `dog_id → dogs.id`, `walk_id → walks.id` | Same, all **on delete cascade** (user_id points to `auth.users`) | Deleting a user, dog or walk cleans up what belongs to it | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 9 | (not in plan) | **`walks.started_at`** (`timestamptz`, nullable) | Needed to detect re-imported Apple Watch workouts | [#22](https://github.com/leekantowski/pawva/pull/22) |
| 10 | (not in plan) | **`unique (user_id, started_at)`** on `walks` | "Skip duplicates" for GPX import, enforced by the database | [#22](https://github.com/leekantowski/pawva/pull/22) |
| 11 | stars: unique (user_id, walk_id) | Same | | [#14](https://github.com/leekantowski/pawva/pull/14) |
| 12 | (not in plan) | Indexes on `dogs(user_id)`, `walks(user_id, walked_on desc)`, `walks(dog_id)`, `stars(walk_id)` | Fast per-user lists and joins | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 13 | RLS on dogs, walks, stars: `user_id = auth.uid()` | Same, **plus** walks may only reference your own dog, and stars may only reference your own walk; stars have no update policy | Closes gaps the plain `user_id` check leaves open | [#8](https://github.com/leekantowski/pawva/pull/8), [#14](https://github.com/leekantowski/pawva/pull/14) |
| 14 | `calories_est` computed on save from the dog's weight at that time | Same: the app stores `0.8 × weight × miles` on create; on edit it recalculates only if the dog or distance changes | As planned | [#10](https://github.com/leekantowski/pawva/pull/10) |
| 15 | (no treat converter column was planned) | No column; the treat converter was replaced by **estimated steps + lifetime totals**, which are computed, not stored | Feature changed | [#24](https://github.com/leekantowski/pawva/pull/24) |
| 16 | (no streak column was planned) | No column; the walk streak is computed from `walked_on` | As planned (no storage needed) | [#26](https://github.com/leekantowski/pawva/pull/26) |

App-only limits, which are checked in the forms and the Server Actions but are not database constraints:
- dog weight ≤ 300 lb and name ≤ 50 characters;
- distance ≤ 1,000 mi and duration ≤ 1,440 min.

These came from [#8](https://github.com/leekantowski/pawva/pull/8) and [#12](https://github.com/leekantowski/pawva/pull/12).
