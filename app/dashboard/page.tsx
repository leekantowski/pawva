import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CaloriesChart from "@/components/CaloriesChart";
import { APP_TIME_ZONE, computeDashboardStats, todayIn, weeklyCalories, type StatWalk } from "@/lib/dashboard/stats";
import { formatPace } from "@/lib/walks/form";

export const metadata = { title: "Dashboard · Pawva" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Second layer of protection in case the proxy is ever bypassed.
  if (!user) redirect("/login");

  // Row-level security: only the logged-in user's walks come back.
  const { data, error } = await supabase
    .from("walks")
    .select("walked_on, distance_mi, duration_min, calories_est")
    .returns<StatWalk[]>();
  const walks = data ?? [];

  const today = todayIn(APP_TIME_ZONE);
  const stats = computeDashboardStats(walks, today);
  const weeks = weeklyCalories(walks, today, 12);

  const pace =
    stats.avgPaceMinPerMile === null ? "–" : formatPace(1, stats.avgPaceMinPerMile).replace(" /mi", "");

  return (
    <main className="container">
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link href="/walks/new" className="btn btn-primary">
          + Log a walk
        </Link>
      </div>

      {error && <p className="error">Couldn&apos;t load your walks. Please refresh.</p>}

      <section className="stat-grid" aria-label="Summary">
        <div className="card stat-tile">
          <span className="stat-tile-label">Calories this week</span>
          <span className="stat-tile-value">{stats.caloriesThisWeek.toLocaleString("en-US")}</span>
          <span className="stat-tile-unit">cal (est.) · Mon–Sun</span>
        </div>
        <div className="card stat-tile">
          <span className="stat-tile-label">Total miles</span>
          <span className="stat-tile-value">{stats.totalMiles.toLocaleString("en-US")}</span>
          <span className="stat-tile-unit">mi</span>
        </div>
        <div className="card stat-tile">
          <span className="stat-tile-label">Average pace</span>
          <span className="stat-tile-value">{pace}</span>
          <span className="stat-tile-unit">min / mile</span>
        </div>
        <div className="card stat-tile">
          <span className="stat-tile-label">Total walks</span>
          <span className="stat-tile-value">{stats.totalWalks.toLocaleString("en-US")}</span>
          <span className="stat-tile-unit">{stats.totalWalks === 1 ? "walk" : "walks"}</span>
        </div>
      </section>

      <section className="card">
        <h2 className="chart-title">Estimated calories per week</h2>
        <p className="muted chart-subtitle">Last 12 weeks · 0.8 × dog weight (lb) × miles</p>
        {walks.length === 0 ? (
          <p className="muted">
            No walks yet. <Link href="/walks/new">Log your first walk</Link> to see the chart.
          </p>
        ) : (
          <CaloriesChart weeks={weeks} />
        )}
      </section>
    </main>
  );
}
