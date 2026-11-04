"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { estimateCalories } from "@/lib/calories";
import { localDateAndTime } from "@/lib/gpx/parse";
import { validateWalk } from "@/lib/walks/form";
import { MAX_IMPORT_BATCH } from "@/lib/gpx/preview";

/** Only the summary numbers come from the browser — never the GPX files themselves. */
export type ImportItem = { startedAt: string; distanceMi: number; durationMin: number };

export type ImportResult =
  | { ok: true; imported: number; skipped: number }
  | { ok: false; error: string };

export async function importGpxWalks(dogId: number, items: ImportItem[]): Promise<ImportResult> {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Tick at least one walk to import." };
  if (items.length > MAX_IMPORT_BATCH) {
    return { ok: false, error: `Please import at most ${MAX_IMPORT_BATCH} walks at a time.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please log in again." };

  // Row-level security: this only finds the user's own dog.
  const { data: dog } = await supabase.from("dogs").select("weight_lb").eq("id", dogId).maybeSingle();
  if (!dog) return { ok: false, error: "Please choose one of your dogs." };
  const weight = Number(dog.weight_lb);

  // Re-check everything on the server; don't trust numbers just because the browser sent them.
  const rows = [];
  for (const item of items) {
    const startMs = Date.parse(String(item?.startedAt));
    if (!Number.isFinite(startMs)) return { ok: false, error: "One of the walks has an invalid start time." };

    const walkedOn = localDateAndTime(startMs).date; // California date, same rule as the browser preview
    const checked = validateWalk({
      walked_on: walkedOn,
      dog_id: String(dogId),
      distance_mi: String(item.distanceMi),
      duration_min: String(item.durationMin),
      notes: "",
    });
    if (!checked.ok) {
      const message = Object.values(checked.errors).find(Boolean);
      return { ok: false, error: `A walk on ${walkedOn} can't be saved: ${message}` };
    }

    rows.push({
      user_id: user.id,
      dog_id: dogId,
      walked_on: walkedOn,
      started_at: new Date(startMs).toISOString(),
      distance_mi: checked.value.distance_mi,
      duration_min: checked.value.duration_min,
      calories_est: estimateCalories(weight, checked.value.distance_mi), // same formula as manual walks
      source: "gpx",
    });
  }

  // Duplicates (same user + start time) are skipped by the database's unique rule,
  // even if two imports run at once. Only newly inserted rows come back.
  const { data: inserted, error } = await supabase
    .from("walks")
    .upsert(rows, { onConflict: "user_id,started_at", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("importGpxWalks failed:", error.message);
    return { ok: false, error: "Couldn't import these walks. Please try again." };
  }

  revalidatePath("/walks");
  revalidatePath("/dashboard");
  const imported = inserted?.length ?? 0;
  return { ok: true, imported, skipped: rows.length - imported };
}
