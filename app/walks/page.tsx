import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPace, formatWalkDate } from "@/lib/walks/form";
import { WALK_COLUMNS, listDogs, type WalkRow } from "@/lib/walks/queries";

export const metadata = { title: "Walks · Pawva" };

export default async function WalksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Second layer of protection in case the proxy is ever bypassed.
  if (!user) redirect("/login");

  // Row-level security: this only ever returns the logged-in user's walks.
  const [{ data: walks, error }, dogs] = await Promise.all([
    supabase
      .from("walks")
      .select(WALK_COLUMNS)
      .order("walked_on", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<WalkRow[]>(),
    listDogs(supabase),
  ]);

  return (
    <main className="container">
      <div className="page-head">
        <h1>Your walks</h1>
        {dogs.length > 0 && (
          <Link href="/walks/new" className="btn btn-primary">
            + Log a walk
          </Link>
        )}
      </div>

      {error && <p className="error">Couldn&apos;t load your walks. Please refresh.</p>}

      {dogs.length === 0 && (
        <section className="card">
          <p>
            First, <Link href="/dogs">add your dog</Link> so walks can be tied to them and calories estimated. 🐾
          </p>
        </section>
      )}

      {dogs.length > 0 && walks && walks.length === 0 && (
        <section className="card">
          <p className="muted">No walks yet. Log your first one!</p>
        </section>
      )}

      {walks && walks.length > 0 && (
        <ul className="walk-list">
          {walks.map((walk) => (
            <li key={walk.id}>
              <Link href={`/walks/${walk.id}`} className="card walk-card">
                <div className="walk-card-head">
                  <strong>{formatWalkDate(walk.walked_on)}</strong>
                  <span className="muted">{walk.dogs?.name ?? "Unknown dog"}</span>
                </div>
                <div className="walk-stats">
                  <div>
                    <span className="stat">{Number(walk.distance_mi)}</span>
                    <span className="stat-label">mi</span>
                  </div>
                  <div>
                    <span className="stat">{Number(walk.duration_min)}</span>
                    <span className="stat-label">min</span>
                  </div>
                  <div>
                    <span className="stat">{formatPace(Number(walk.distance_mi), Number(walk.duration_min))}</span>
                    <span className="stat-label">pace</span>
                  </div>
                  <div>
                    <span className="stat">{Math.round(Number(walk.calories_est))}</span>
                    <span className="stat-label">cal (est.)</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
