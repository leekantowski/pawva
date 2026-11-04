import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createWalk } from "@/app/walks/actions";
import WalkForm from "@/components/WalkForm";
import { EMPTY_WALK_FORM } from "@/lib/walks/form";
import { listDogs } from "@/lib/walks/queries";

export const metadata = { title: "Log a walk · Pawva" };

export default async function NewWalkPage() {
  const supabase = await createClient();
  const dogs = await listDogs(supabase);

  if (dogs.length === 0) {
    return (
      <main className="container narrow">
        <section className="card">
          <h1>Log a walk</h1>
          <p>
            You need a dog first. <Link href="/dogs">Add your dog</Link>, then come back.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="container narrow">
      <WalkForm
        dogs={dogs}
        action={createWalk}
        initialValues={EMPTY_WALK_FORM}
        title="Log a walk"
        submitLabel="Save walk"
        cancelHref="/walks"
      />
    </main>
  );
}
