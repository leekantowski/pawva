import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimateCalories } from "@/lib/calories";
import DogForm from "@/components/DogForm";

export const metadata = { title: "Dogs · Pawva" };

type Dog = { id: number; name: string; breed: string | null; weight_lb: number };

export default async function DogsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row-level security means this only ever returns the logged-in user's dogs.
  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("id, name, breed, weight_lb")
    .order("created_at", { ascending: true })
    .returns<Dog[]>();

  return (
    <main className="container">
      <h1>Your dogs</h1>

      {error && <p className="error">Couldn&apos;t load your dogs. Please refresh.</p>}

      {dogs && dogs.length === 0 && <p className="muted">No dogs yet. Add your first one below.</p>}

      {dogs && dogs.length > 0 && (
        <ul className="dog-list">
          {dogs.map((dog) => (
            <li key={dog.id} className="card dog-card">
              <div>
                <strong>{dog.name}</strong>
                {dog.breed && <span className="muted"> · {dog.breed}</span>}
              </div>
              <div className="dog-stats">
                <span>{Number(dog.weight_lb)} lb</span>
                <span className="muted">~{estimateCalories(Number(dog.weight_lb), 1)} cal/mile (est.)</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DogForm />
    </main>
  );
}
