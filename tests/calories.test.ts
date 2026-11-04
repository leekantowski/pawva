import { describe, it, expect } from "vitest";
import { estimateCalories } from "@/lib/calories";

describe("estimateCalories (0.8 × weight_lb × distance_mi)", () => {
  it("gives Luna (65 lb) about 52 calories per mile", () => {
    expect(estimateCalories(65, 1)).toBe(52);
  });

  it("scales with distance: 65 lb over 3 miles is 156", () => {
    expect(estimateCalories(65, 3)).toBe(156);
  });

  it("rounds to one decimal place", () => {
    // 0.8 × 12.3 × 1.7 = 16.728 → 16.7
    expect(estimateCalories(12.3, 1.7)).toBe(16.7);
  });
});
