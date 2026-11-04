// Walk streaks. Pure function: pass in walk dates (YYYY-MM-DD, already in California time,
// which is how walks are stored) and "today" in California time.
import { addDays } from "@/lib/dashboard/stats";

export type Streak = {
  current: number; // consecutive days with ≥ 1 walk, ending today — or yesterday if there's no walk yet today
  longest: number; // longest run of consecutive walk days ever
  walkedToday: boolean;
};

export function computeStreak(walkDates: string[], today: string): Streak {
  // One entry per day (several walks on a day count once); ignore anything dated after today.
  const days = new Set(walkDates.filter((d) => d <= today));
  const walkedToday = days.has(today);

  // Current streak: count back from today, or from yesterday if today has no walk yet
  // (the day isn't over, so the streak isn't broken).
  let current = 0;
  for (let day = walkedToday ? today : addDays(today, -1); days.has(day); day = addDays(day, -1)) current++;

  // Longest streak: walk through the days in order, extending a run while each day follows the last.
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of [...days].sort()) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = day;
  }

  return { current, longest, walkedToday };
}
