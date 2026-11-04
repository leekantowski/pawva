import { describe, it, expect } from "vitest";
import { computeStreak } from "@/lib/dashboard/streak";

const TODAY = "2026-11-04";

describe("computeStreak — current streak", () => {
  it("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-11-02", "2026-11-03", "2026-11-04"], TODAY)).toMatchObject({
      current: 3,
      walkedToday: true,
    });
  });

  it("today/yesterday rule: with no walk yet today, the streak still counts through yesterday", () => {
    expect(computeStreak(["2026-11-01", "2026-11-02", "2026-11-03"], TODAY)).toMatchObject({
      current: 3,
      walkedToday: false,
    });
  });

  it("is broken (0) once a whole day is missed", () => {
    // Last walk was two days ago: yesterday (Nov 3) had no walk.
    expect(computeStreak(["2026-11-01", "2026-11-02"], TODAY).current).toBe(0);
  });

  it("counts several walks on one day as a single day", () => {
    expect(computeStreak(["2026-11-04", "2026-11-04", "2026-11-03"], TODAY).current).toBe(2);
  });

  it("works across a month boundary", () => {
    expect(computeStreak(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01").current).toBe(3);
  });

  it("ignores walks dated in the future", () => {
    expect(computeStreak(["2026-11-04", "2026-11-05", "2026-11-06"], TODAY).current).toBe(1);
  });
});

describe("computeStreak — longest streak", () => {
  it("finds the longest run ever, even if it's in the past", () => {
    const dates = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-11-03", "2026-11-04"];
    expect(computeStreak(dates, TODAY)).toEqual({ current: 2, longest: 4, walkedToday: true });
  });

  it("is 0 with no walks", () => {
    expect(computeStreak([], TODAY)).toEqual({ current: 0, longest: 0, walkedToday: false });
  });
});
