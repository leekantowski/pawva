"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { estimateCalories } from "@/lib/calories";
import { readWalkForm, shouldRecalculateCalories, validateWalk, type WalkFormValues } from "@/lib/walks/form";
import type { FormState } from "@/lib/validation";

export type WalkFormState = FormState<WalkFormValues>;

const SAVE_ERROR = "Couldn't save this walk. Please try again.";
const NOT_YOUR_DOG = "Please choose one of your dogs.";

const formError = (message: string, values: WalkFormValues): WalkFormState => ({ formError: message, fieldErrors: {}, values });

/** Looks up the dog's weight. Row-level security means this only finds the user's own dogs. */
async function dogWeight(supabase: Awaited<ReturnType<typeof createClient>>, dogId: number) {
  const { data } = await supabase.from("dogs").select("weight_lb").eq("id", dogId).maybeSingle();
  return data ? Number(data.weight_lb) : null;
}

export async function createWalk(_prev: WalkFormState, formData: FormData): Promise<WalkFormState> {
  const values = readWalkForm(formData);
  // Server-side check: runs even if the browser check was bypassed.
  const result = validateWalk(values);
  if (!result.ok) return { formError: null, fieldErrors: result.errors, values };
  const walk = result.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return formError("Your session expired. Please log in again.", values);

  const weight = await dogWeight(supabase, walk.dog_id);
  if (weight === null) return { formError: null, fieldErrors: { dog_id: NOT_YOUR_DOG }, values };

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
    return formError(SAVE_ERROR, values);
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
  // Server-side check: runs even if the browser check was bypassed.
  const result = validateWalk(values);
  if (!result.ok) return { formError: null, fieldErrors: result.errors, values };
  const walk = result.value;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("walks")
    .select("dog_id, distance_mi, calories_est")
    .eq("id", walkId)
    .maybeSingle();
  if (!existing) return formError("That walk no longer exists.", values);

  let calories_est = Number(existing.calories_est);
  if (shouldRecalculateCalories({ dog_id: existing.dog_id, distance_mi: Number(existing.distance_mi) }, walk)) {
    const weight = await dogWeight(supabase, walk.dog_id);
    if (weight === null) return { formError: null, fieldErrors: { dog_id: NOT_YOUR_DOG }, values };
    calories_est = estimateCalories(weight, walk.distance_mi);
  }

  const { data: updated, error } = await supabase
    .from("walks")
    .update({ ...walk, calories_est })
    .eq("id", walkId)
    .select("id");

  if (error || !updated || updated.length === 0) {
    console.error("updateWalk failed:", error?.message);
    return formError(SAVE_ERROR, values);
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
