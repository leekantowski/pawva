"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { estimateCalories } from "@/lib/calories";
import { parseWalkForm, readWalkForm, shouldRecalculateCalories, type WalkFormValues } from "@/lib/walks/form";

export type WalkFormState = { error: string | null; values: WalkFormValues };

const GENERIC_ERROR = "Couldn't save this walk. Check the fields and try again.";

/** Looks up the dog's weight. Row-level security means this only finds the user's own dogs. */
async function dogWeight(supabase: Awaited<ReturnType<typeof createClient>>, dogId: number) {
  const { data } = await supabase.from("dogs").select("weight_lb").eq("id", dogId).maybeSingle();
  return data ? Number(data.weight_lb) : null;
}

export async function createWalk(_prev: WalkFormState, formData: FormData): Promise<WalkFormState> {
  const values = readWalkForm(formData);
  const walk = parseWalkForm(values);
  if (!walk) return { error: GENERIC_ERROR, values };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again.", values };

  const weight = await dogWeight(supabase, walk.dog_id);
  if (weight === null) return { error: "Please pick one of your dogs.", values };

  const { data, error } = await supabase
    .from("walks")
    .insert({
      ...walk,
      user_id: user.id,
      calories_est: estimateCalories(weight, walk.distance_mi),
      source: "manual",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createWalk failed:", error?.message);
    return { error: GENERIC_ERROR, values };
  }

  revalidatePath("/walks");
  redirect(`/walks/${data.id}`);
}

export async function updateWalk(
  walkId: number,
  _prev: WalkFormState,
  formData: FormData,
): Promise<WalkFormState> {
  const values = readWalkForm(formData);
  const walk = parseWalkForm(values);
  if (!walk) return { error: GENERIC_ERROR, values };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("walks")
    .select("dog_id, distance_mi, calories_est")
    .eq("id", walkId)
    .maybeSingle();
  if (!existing) return { error: "That walk no longer exists.", values };

  let calories_est = Number(existing.calories_est);
  if (shouldRecalculateCalories({ dog_id: existing.dog_id, distance_mi: Number(existing.distance_mi) }, walk)) {
    const weight = await dogWeight(supabase, walk.dog_id);
    if (weight === null) return { error: "Please pick one of your dogs.", values };
    calories_est = estimateCalories(weight, walk.distance_mi);
  }

  const { data: updated, error } = await supabase
    .from("walks")
    .update({ ...walk, calories_est })
    .eq("id", walkId)
    .select("id");

  if (error || !updated || updated.length === 0) {
    console.error("updateWalk failed:", error?.message);
    return { error: GENERIC_ERROR, values };
  }

  revalidatePath("/walks");
  revalidatePath(`/walks/${walkId}`);
  redirect(`/walks/${walkId}`);
}

export async function deleteWalk(walkId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("walks").delete().eq("id", walkId);
  if (error) console.error("deleteWalk failed:", error.message);

  revalidatePath("/walks");
  redirect("/walks");
}
