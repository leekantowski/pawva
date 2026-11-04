// Estimated dog steps, like a pedometer worn on one paw: one "step" is one footfall of the
// same paw, so the distance per step is the dog's full STRIDE (the gap between two prints of
// that same paw). There's no step sensor, so this is an estimate from distance and size.
//
// Stride is set by leg length, so it's bucketed by weight (a stand-in for size):
//   small  (under 25 lb)  ≈ 12 in at the shoulder → ~18 in stride
//   medium (25–59.9 lb)   ≈ 19 in at the shoulder → ~28 in stride
//   large  (60 lb and up) ≈ 24 in at the shoulder → ~36 in stride
// using the rule of thumb that a dog's walking stride is about 1.5 × its shoulder height.

export type SizeBucket = "small" | "medium" | "large";

export const SMALL_MAX_LB = 25; // under 25 lb is small
export const LARGE_MIN_LB = 60; // 60 lb and up is large

export const STRIDE_INCHES: Record<SizeBucket, number> = { small: 18, medium: 28, large: 36 };

const INCHES_PER_MILE = 63_360;

export function sizeBucket(weightLb: number): SizeBucket {
  if (weightLb < SMALL_MAX_LB) return "small";
  if (weightLb < LARGE_MIN_LB) return "medium";
  return "large";
}

/** Estimated steps (one paw's footfalls) for a walk, rounded to a whole step. */
export function estimateSteps(distanceMi: number, weightLb: number): number {
  if (!(distanceMi > 0) || !(weightLb > 0)) return 0;
  return Math.round((distanceMi * INCHES_PER_MILE) / STRIDE_INCHES[sizeBucket(weightLb)]);
}
