"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StarResult = { ok: true; starred: boolean } | { ok: false; error: string };

/** Stars or unstars one of the user's walks. Safe to call twice (idempotent). */
export async function setStar(walkId: number, starred: boolean): Promise<StarResult> {
  if (!Number.isSafeInteger(walkId) || walkId <= 0) return { ok: false, error: "Unknown walk." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in again." };

  if (starred) {
    // Row-level security rejects starring a walk that isn't yours.
    const { error } = await supabase.from("stars").insert({ user_id: user.id, walk_id: walkId });
    // 23505 = unique violation: it was already starred, which is fine.
    if (error && error.code !== "23505") {
      console.error("star failed:", error.message);
      return { ok: false, error: "Couldn't star this walk." };
    }
  } else {
    const { error } = await supabase.from("stars").delete().eq("walk_id", walkId).eq("user_id", user.id);
    if (error) {
      console.error("unstar failed:", error.message);
      return { ok: false, error: "Couldn't unstar this walk." };
    }
  }

  revalidatePath("/walks");
  revalidatePath(`/walks/${walkId}`);
  return { ok: true, starred };
}
