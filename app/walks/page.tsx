import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StarButton from "@/components/StarButton";
import { formatPace, formatWalkDate } from "@/lib/walks/form";
import { isStarred, listDogs, listWalks } from "@/lib/walks/queries";
import WalkFilters from "@/components/WalkFilters";
import { isFiltering, parseWalkFilters, walksHref } from "@/lib/walks/filters";

export const metadata = { title: "Walks · Pawva" };

export default async function WalksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseWalkFilters(await searchParams);
  const { view } = filters;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Second layer of protection in case the proxy is ever bypassed.
  if (!user) redirect("/login");

  // Row-level security: this only ever returns the logged-in user's walks and stars.
  const [{ data: walks, error }, dogs] = await Promise.all([listWalks(supabase, filters), listDogs(supabase)]);

  return (
    <main className="container">
      <div className="page-head">
        <h1>{view === "starred" ? "Starred walks" : "Your walks"}</h1>
        {dogs.length > 0 && (
          <div className="head-actions">
            <Link href="/walks/import" className="btn btn-secondary">
              Import from Apple Watch
            </Link>
            <Link href="/walks/new" className="btn btn-primary">
              + Log a walk
            </Link>
          </div>
        )}
      </div>

      {/* Tabs keep the current search, dates and sort. */}
      <nav className="tabs" aria-label="Which walks to show">
        <Link
          href={walksHref(filters, { view: "all" })}
          className={view === "all" ? "tab is-active" : "tab"}
          aria-current={view === "all" ? "page" : undefined}
        >
          All walks
        </Link>
        <Link
          href={walksHref(filters, { view: "starred" })}
          className={view === "starred" ? "tab is-active" : "tab"}
          aria-current={view === "starred" ? "page" : undefined}
        >
          ★ Starred
        </Link>
      </nav>

      {dogs.length > 0 && <WalkFilters filters={filters} />}

      {walks && (isFiltering(filters) || walks.length > 0) && (
        <p className="result-count muted" aria-live="polite">
          {walks.length} {walks.length === 1 ? "walk" : "walks"}
          {isFiltering(filters) ? " match" + (walks.length === 1 ? "es" : "") : ""}
        </p>
      )}

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
          {isFiltering(filters) ? (
            <p className="muted">
              No walks match these filters.{" "}
              <Link href={walksHref(filters, { q: "", from: "", to: "" })}>Clear search and dates</Link>
            </p>
          ) : view === "starred" ? (
            <p className="muted">No starred walks yet. Tap ☆ on a walk to star it.</p>
          ) : (
            <p className="muted">No walks yet. Log your first one!</p>
          )}
        </section>
      )}

      {walks && walks.length > 0 && (
        <ul className="walk-list">
          {walks.map((walk) => (
            <li key={walk.id} className="card walk-card">
              <div className="walk-card-head">
                <Link href={`/walks/${walk.id}`} className="walk-card-link">
                  <strong>{formatWalkDate(walk.walked_on)}</strong>
                  <span className="muted"> · {walk.dogs?.name ?? "Unknown dog"}</span>
                </Link>
                <StarButton walkId={walk.id} starred={isStarred(walk)} />
              </div>
              <Link href={`/walks/${walk.id}`} className="walk-stats" tabIndex={-1} aria-hidden="true">
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
