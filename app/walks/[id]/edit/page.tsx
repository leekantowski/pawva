import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateWalk } from "@/app/walks/actions";
import WalkForm from "@/components/WalkForm";
import { parseWalkId } from "@/lib/walks/form";
import { getWalk, listDogs } from "@/lib/walks/queries";

export const metadata = { title: "Edit walk · Pawva" };

export default async function EditWalkPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseWalkId((await params).id);
  if (id === null) notFound();

  const supabase = await createClient();
  const [walk, dogs] = await Promise.all([getWalk(supabase, id), listDogs(supabase)]);
  if (!walk) notFound();

  return (
    <main className="container narrow">
      <WalkForm
        dogs={dogs}
        action={updateWalk.bind(null, walk.id)}
        initialValues={{
          walked_on: walk.walked_on,
          dog_id: String(walk.dog_id),
          distance_mi: String(Number(walk.distance_mi)),
          duration_min: String(Number(walk.duration_min)),
          notes: walk.notes ?? "",
        }}
        title="Edit walk"
        submitLabel="Save changes"
        cancelHref={`/walks/${walk.id}`}
      />
    </main>
  );
}
