import type { createClient } from "@/lib/supabase/server";
import { notesPattern, sortOrder, type WalkFilters } from "@/lib/walks/filters";

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

/**
 * The user's walks with search, date range, Starred tab and sort applied — all in one query.
 * Row-level security limits it to the user's own walks (and own stars).
 */
export async function listWalks(supabase: Supabase, filters: WalkFilters) {
  let query = supabase.from("walks").select(filters.view === "starred" ? STARRED_WALK_COLUMNS : WALK_COLUMNS);

  if (filters.q) query = query.ilike("notes", notesPattern(filters.q));
  if (filters.from) query = query.gte("walked_on", filters.from);
  if (filters.to) query = query.lte("walked_on", filters.to);

  for (const { column, ascending } of sortOrder(filters.sort)) {
    query = query.order(column, { ascending });
  }
  return query.returns<WalkRow[]>();
}
