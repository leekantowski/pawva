"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateDog } from "@/lib/dogs/validate";

export type DogFormState = {
  error: string | null;
  saved: boolean;
  savedCount: number; // bumps on each successful save so the form can reset
  values: { name: string; breed: string; weight: string };
};

export async function addDog(prev: DogFormState, formData: FormData): Promise<DogFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    weight: String(formData.get("weight") ?? ""),
  };

  const result = validateDog(values);
  if (!result.ok) return { error: result.error, saved: false, savedCount: prev.savedCount, values };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again.", saved: false, savedCount: prev.savedCount, values };

  const { error } = await supabase.from("dogs").insert({
    user_id: user.id,
    name: result.dog.name,
    breed: result.dog.breed,
    weight_lb: result.dog.weightLb,
  });

  if (error) {
    console.error("addDog failed:", error.message);
    return { error: "Couldn't save your dog. Please try again.", saved: false, savedCount: prev.savedCount, values };
  }

  revalidatePath("/dogs");
  return { error: null, saved: true, savedCount: prev.savedCount + 1, values: { name: "", breed: "", weight: "" } };
}
