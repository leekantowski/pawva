// Dashboard math. Pure functions only (no database, no clock), so they're easy to test:
// the caller passes in the walks and "today".

export type StatWalk = {
  walked_on: string; // YYYY-MM-DD
  distance_mi: number;
  duration_min: number;
  calories_est: number; // stored on the walk when it was saved (0.8 × weight × miles)
};

export type DashboardStats = {
  totalWalks: number;
  totalMiles: number; // rounded to 0.1
  caloriesThisWeek: number; // whole calories, Monday–Sunday of today's week
  avgPaceMinPerMile: number | null; // total minutes ÷ total miles; null when there are no miles
};

export type WeekCalories = { weekStart: string; label: string; calories: number };

/** The app's "today" uses one fixed time zone so a late-evening walk doesn't land in tomorrow. */
export const APP_TIME_ZONE = "America/Los_Angeles";

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Monday of the week containing `iso` (weeks run Monday–Sunday). */
export function weekStart(iso: string): string {
  const daysSinceMonday = (toDate(iso).getUTCDay() + 6) % 7; // Sun=0 → 6, Mon=1 → 0
  return addDays(iso, -daysSinceMonday);
}

/** Today's date (YYYY-MM-DD) in the given time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** The four summary numbers on the dashboard. */
export function computeDashboardStats(walks: StatWalk[], today: string): DashboardStats {
  const thisMonday = weekStart(today);
  const thisSunday = addDays(thisMonday, 6);

  let miles = 0;
  let minutes = 0;
  let caloriesThisWeek = 0;
  for (const walk of walks) {
    miles += Number(walk.distance_mi);
    minutes += Number(walk.duration_min);
    if (walk.walked_on >= thisMonday && walk.walked_on <= thisSunday) {
      caloriesThisWeek += Number(walk.calories_est);
    }
  }

  return {
    totalWalks: walks.length,
    totalMiles: Math.round(miles * 10) / 10,
    caloriesThisWeek: Math.round(caloriesThisWeek),
    avgPaceMinPerMile: miles > 0 ? minutes / miles : null,
  };
}

/** Estimated calories per week for the last `weeks` weeks (oldest first), including empty weeks. */
export function weeklyCalories(walks: StatWalk[], today: string, weeks = 12): WeekCalories[] {
  const lastMonday = weekStart(today);
  const firstMonday = addDays(lastMonday, -7 * (weeks - 1));

  const totals = new Map<string, number>();
  for (let i = 0; i < weeks; i++) totals.set(addDays(firstMonday, 7 * i), 0);

  for (const walk of walks) {
    const monday = weekStart(walk.walked_on);
    if (totals.has(monday)) totals.set(monday, totals.get(monday)! + Number(walk.calories_est));
  }

  return [...totals].map(([monday, calories]) => ({
    weekStart: monday,
    label: toDate(monday).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" }),
    calories: Math.round(calories),
  }));
}
