import { describe, it, expect } from "vitest";
import { estimateCalories } from "@/lib/calories";
import { computeDashboardStats, todayIn, weekStart, weeklyCalories, type StatWalk } from "@/lib/dashboard/stats";

// Wednesday. Its week runs Monday 2026-11-02 to Sunday 2026-11-08.
const TODAY = "2026-11-04";

/** A walk with a 65 lb dog. Calories are stored on the walk at save time, exactly like the app does. */
function walkWithLuna(walked_on: string, distance_mi: number, duration_min = 20 * distance_mi): StatWalk {
  return { walked_on, distance_mi, duration_min, calories_est: estimateCalories(65, distance_mi) };
}

// ── PLAN.md §4, Test 2 ────────────────────────────────────────────────────────
describe("PLAN.md Test 2 — dashboard 'calories this week'", () => {
  it("Given a 65 lb dog with two walks this week of 1.0 and 2.0 miles, it shows 156 (0.8 × 65 × 3.0)", () => {
    const walks = [walkWithLuna("2026-11-02", 1.0), walkWithLuna("2026-11-04", 2.0)];

    const stats = computeDashboardStats(walks, TODAY);

    expect(stats.caloriesThisWeek).toBe(156);
  });
});
// ─────────────────────────────────────────────────────────────────────────────

describe("computeDashboardStats (the other summary numbers)", () => {
  const walks = [
    walkWithLuna("2026-10-28", 1.5, 30), // last week
    walkWithLuna("2026-11-02", 1.0, 20), // this week (Monday)
    walkWithLuna("2026-11-08", 2.0, 40), // this week (Sunday)
  ];

  it("only counts this week's walks (Monday–Sunday) in calories this week", () => {
    expect(computeDashboardStats(walks, TODAY).caloriesThisWeek).toBe(156);
  });

  it("totals all miles and walks", () => {
    const stats = computeDashboardStats(walks, TODAY);
    expect(stats.totalMiles).toBe(4.5);
    expect(stats.totalWalks).toBe(3);
  });

  it("average pace is total minutes ÷ total miles (90 min ÷ 4.5 mi = 20 min/mi)", () => {
    expect(computeDashboardStats(walks, TODAY).avgPaceMinPerMile).toBe(20);
  });

  it("shows zeros (and no pace) when there are no walks", () => {
    expect(computeDashboardStats([], TODAY)).toEqual({
      totalWalks: 0,
      totalMiles: 0,
      caloriesThisWeek: 0,
      avgPaceMinPerMile: null,
    });
  });
});

describe("weeklyCalories (the chart's data)", () => {
  it("gives one bar per week, oldest first, including empty weeks", () => {
    const weeks = weeklyCalories([walkWithLuna("2026-11-02", 1), walkWithLuna("2026-10-21", 2)], TODAY, 3);
    expect(weeks).toEqual([
      { weekStart: "2026-10-19", label: "Oct 19", calories: 104 },
      { weekStart: "2026-10-26", label: "Oct 26", calories: 0 },
      { weekStart: "2026-11-02", label: "Nov 2", calories: 52 },
    ]);
  });

  it("ignores walks older than the chart's range", () => {
    const weeks = weeklyCalories([walkWithLuna("2025-01-01", 5)], TODAY, 12);
    expect(weeks.every((w) => w.calories === 0)).toBe(true);
  });
});

describe("week and date helpers", () => {
  it("weeks start on Monday", () => {
    expect(weekStart("2026-11-04")).toBe("2026-11-02"); // Wednesday → Monday
    expect(weekStart("2026-11-08")).toBe("2026-11-02"); // Sunday belongs to the week before
    expect(weekStart("2026-11-09")).toBe("2026-11-09"); // Monday starts a new week
  });

  it("'today' uses California time, not the server's UTC clock", () => {
    // 2026-11-05 03:00 UTC is still the evening of Nov 4 in California.
    expect(todayIn("America/Los_Angeles", new Date("2026-11-05T03:00:00Z"))).toBe("2026-11-04");
  });
});
