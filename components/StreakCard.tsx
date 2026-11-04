import type { Streak } from "@/lib/dashboard/streak";

const days = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "day" : "days"}`;

/** Current walk streak + longest ever, with a nudge about today. */
export default function StreakCard({ streak }: { streak: Streak }) {
  const { current, longest, walkedToday } = streak;

  const nudge =
    current > 0
      ? walkedToday
        ? "✓ Walked today"
        : "No walk yet today. Walk today to keep it going!"
      : longest > 0
        ? "Start a new streak with a walk today."
        : "Log a walk to start a streak.";

  return (
    <section className="card streak-card" aria-labelledby="streak-title">
      <h2 id="streak-title" className="streak-title">
        🔥 Walk streak
      </h2>
      <div className="streak-grid">
        <div>
          <span className="streak-label">Current streak</span>
          <span className="streak-value">{days(current)}</span>
        </div>
        <div>
          <span className="streak-label">Longest streak</span>
          <span className="streak-value">{days(longest)}</span>
        </div>
      </div>
      <p className={walkedToday ? "streak-nudge is-done" : "streak-nudge"}>{nudge}</p>
    </section>
  );
}
