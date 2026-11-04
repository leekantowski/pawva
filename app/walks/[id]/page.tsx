import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteWalk } from "@/app/walks/actions";
import DeleteWalkButton from "@/components/DeleteWalkButton";
import { formatPace, formatWalkDate, parseWalkId } from "@/lib/walks/form";
import { getWalk } from "@/lib/walks/queries";

export const metadata = { title: "Walk · Pawva" };

export default async function WalkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseWalkId((await params).id);
  if (id === null) notFound();

  const supabase = await createClient();
  // Returns null for someone else's walk too (row-level security), so they get a 404.
  const walk = await getWalk(supabase, id);
  if (!walk) notFound();

  const distance = Number(walk.distance_mi);
  const duration = Number(walk.duration_min);

  return (
    <main className="container narrow">
      <p>
        <Link href="/walks">← All walks</Link>
      </p>
      <section className="card">
        <p className="eyebrow">{walk.dogs?.name ?? "Unknown dog"}</p>
        <h1>{formatWalkDate(walk.walked_on)}</h1>

        <dl className="detail-grid">
          <div>
            <dt>Distance</dt>
            <dd>{distance} mi</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{duration} min</dd>
          </div>
          <div>
            <dt>Pace</dt>
            <dd>{formatPace(distance, duration)}</dd>
          </div>
          <div>
            <dt>Calories (est.)</dt>
            <dd>{Math.round(Number(walk.calories_est))} cal</dd>
          </div>
        </dl>

        {walk.notes && (
          <>
            <h2 className="small-heading">Notes</h2>
            <p className="notes">{walk.notes}</p>
          </>
        )}

        <div className="actions">
          <Link href={`/walks/${walk.id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <DeleteWalkButton action={deleteWalk.bind(null, walk.id)} />
        </div>
      </section>
    </main>
  );
}
