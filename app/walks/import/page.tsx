import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GpxImporter from "@/components/GpxImporter";
import { listDogs } from "@/lib/walks/queries";

export const metadata = { title: "Import from Apple Watch · Pawva" };

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row-level security: only this user's dogs and walks. Start times let the preview flag "Already imported".
  const [dogs, { data: started, error }] = await Promise.all([
    listDogs(supabase),
    supabase.from("walks").select("started_at").not("started_at", "is", null),
  ]);

  return (
    <main className="container">
      <p>
        <Link href="/walks">← All walks</Link>
      </p>
      <h1>Import from Apple Watch</h1>
      {error ? (
        <p className="error">Couldn&apos;t load your walks. Please refresh.</p>
      ) : (
        <GpxImporter dogs={dogs} existingStartedAt={(started ?? []).map((w) => String(w.started_at))} />
      )}
    </main>
  );
}
