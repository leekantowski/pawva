import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type DogOption = { id: number; name: string };

export type WalkRow = {
  id: number;
  dog_id: number;
  walked_on: string;
  distance_mi: number;
  duration_min: number;
  calories_est: number;
  notes: string | null;
  source: string;
  dogs: { name: string } | null;
};

export const WALK_COLUMNS = "id, dog_id, walked_on, distance_mi, duration_min, calories_est, notes, source, dogs(name)";

/** The logged-in user's dogs (row-level security filters out everyone else's). */
export async function listDogs(supabase: Supabase): Promise<DogOption[]> {
  const { data } = await supabase.from("dogs").select("id, name").order("created_at").returns<DogOption[]>();
  return data ?? [];
}

/** One walk by id, or null if it doesn't exist or isn't yours. */
export async function getWalk(supabase: Supabase, id: number): Promise<WalkRow | null> {
  const { data } = await supabase.from("walks").select(WALK_COLUMNS).eq("id", id).returns<WalkRow[]>().maybeSingle();
  return data ?? null;
}
