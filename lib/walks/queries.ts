import type { createClient } from "@/lib/supabase/server";
import type { WalksView } from "@/lib/walks/view";

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
  /** The logged-in user's star on this walk (RLS hides other users' stars): [] or [{ walk_id }]. */
  stars: { walk_id: number }[];
};

const BASE_COLUMNS = "id, dog_id, walked_on, distance_mi, duration_min, calories_est, notes, source, dogs(name)";
export const WALK_COLUMNS = `${BASE_COLUMNS}, stars(walk_id)`;
/** `!inner` turns the stars join into a filter: only walks that have one of my stars. */
const STARRED_WALK_COLUMNS = `${BASE_COLUMNS}, stars!inner(walk_id)`;

export const isStarred = (walk: Pick<WalkRow, "stars">) => (walk.stars?.length ?? 0) > 0;

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

/** The user's walks, newest first. view "starred" returns only walks the user has starred. */
export async function listWalks(supabase: Supabase, view: WalksView) {
  return supabase
    .from("walks")
    .select(view === "starred" ? STARRED_WALK_COLUMNS : WALK_COLUMNS)
    .order("walked_on", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<WalkRow[]>();
}
