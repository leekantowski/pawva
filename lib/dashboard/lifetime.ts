// Lifetime totals per dog for the top of the dashboard. Pure function: pass in walks and dogs.
import { estimateSteps } from "@/lib/steps";

export type LifetimeWalk = { dog_id: number; distance_mi: number; calories_est: number };
export type LifetimeDog = { id: number; name: string; weight_lb: number };

export type LifetimeTotals = {
  dogId: number;
  dogName: string;
  miles: number; // rounded to 0.1
  calories: number; // whole calories (sum of each walk's stored estimate)
  steps: number; // sum of each walk's estimated steps
  walks: number;
};

/** One entry per dog, in the order the dogs are given (oldest dog first). */
export function lifetimeTotals(walks: LifetimeWalk[], dogs: LifetimeDog[]): LifetimeTotals[] {
  return dogs.map((dog) => {
    let miles = 0;
    let calories = 0;
    let steps = 0;
    let count = 0;
    for (const walk of walks) {
      if (walk.dog_id !== dog.id) continue;
      const distance = Number(walk.distance_mi);
      miles += distance;
      calories += Number(walk.calories_est);
      steps += estimateSteps(distance, Number(dog.weight_lb));
      count++;
    }
    return {
      dogId: dog.id,
      dogName: dog.name,
      miles: Math.round(miles * 10) / 10,
      calories: Math.round(calories),
      steps,
      walks: count,
    };
  });
}

/** "Luna’s", "Biscuit’s" — for card titles. */
export const possessive = (name: string) => `${name}’s`;
