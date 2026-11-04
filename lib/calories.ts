// Calorie estimate from PLAN.md: 0.8 × dog weight (lb) × distance (miles).
// Stored on each walk when it's saved, so old walks keep the estimate from that day.

export const CAL_PER_LB_PER_MILE = 0.8;

/** Estimated calories, rounded to 1 decimal place. */
export function estimateCalories(weightLb: number, distanceMi: number): number {
  return Math.round(CAL_PER_LB_PER_MILE * weightLb * distanceMi * 10) / 10;
}
