import { describe, it, expect } from "vitest";
import { estimateSteps, sizeBucket } from "@/lib/steps";
import { lifetimeTotals } from "@/lib/dashboard/lifetime";

describe("estimateSteps (one paw's footfalls = distance ÷ stride)", () => {
  it("Luna (65 lb, large, 36 in stride) takes 1,760 steps per mile", () => {
    expect(estimateSteps(1, 65)).toBe(1760); // 63,360 in ÷ 36 in
  });

  it("smaller dogs take more steps for the same distance", () => {
    expect(estimateSteps(1, 40)).toBe(2263); // medium, 28 in stride: 63,360 ÷ 28 = 2,262.9
    expect(estimateSteps(1, 15)).toBe(3520); // small, 18 in stride
  });

  it("scales with distance (2.5 mi for Luna = 4,400 steps)", () => {
    expect(estimateSteps(2.5, 65)).toBe(4400);
  });

  it("is 0 for no distance", () => {
    expect(estimateSteps(0, 65)).toBe(0);
  });
});

describe("sizeBucket (weight cutoffs)", () => {
  it("small is under 25 lb, medium 25–59.9 lb, large 60 lb and up", () => {
    expect([24.9, 25, 59.9, 60].map(sizeBucket)).toEqual(["small", "medium", "medium", "large"]);
  });
});

describe("lifetimeTotals (dashboard card)", () => {
  it("adds up Luna's miles, stored calories, estimated steps, and walks", () => {
    const luna = { id: 1, name: "Luna", weight_lb: 65 };
    const walks = [
      { dog_id: 1, distance_mi: 1.0, calories_est: 52 },
      { dog_id: 1, distance_mi: 2.0, calories_est: 104 },
      { dog_id: 2, distance_mi: 5.0, calories_est: 99 }, // another dog's walk isn't counted
    ];
    expect(lifetimeTotals(walks, [luna])).toEqual([
      { dogId: 1, dogName: "Luna", miles: 3, calories: 156, steps: 5280, walks: 2 },
    ]);
  });
});
