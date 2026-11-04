"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateDog, type DogFormValues } from "@/lib/dogs/validate";
import { readFields, type FormState } from "@/lib/validation";

export type DogFormState = FormState<DogFormValues> & {
  saved: boolean;
  savedCount: number; // bumps on each successful save so the form can reset
};

const DOG_FIELDS = ["name", "breed", "weight"] as const;
const EMPTY: DogFormValues = { name: "", breed: "", weight: "" };

export async function addDog(prev: DogFormState, formData: FormData): Promise<DogFormState> {
  const values = readFields(formData, DOG_FIELDS);
  const fail = (patch: Partial<DogFormState>): DogFormState => ({
    formError: null,
    fieldErrors: {},
    values,
    saved: false,
    savedCount: prev.savedCount,
    ...patch,
  });

  // Server-side check: runs even if the browser check was bypassed.
  const result = validateDog(values);
  if (!result.ok) return fail({ fieldErrors: result.errors });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail({ formError: "Your session expired. Please log in again." });

  const { error } = await supabase.from("dogs").insert({
    user_id: user.id,
    name: result.value.name,
    breed: result.value.breed,
    weight_lb: result.value.weightLb,
  });

  if (error) {
    console.error("addDog failed:", error.message);
    return fail({ formError: "Couldn't save your dog. Please try again." });
  }

  revalidatePath("/dogs");
  return { formError: null, fieldErrors: {}, values: EMPTY, saved: true, savedCount: prev.savedCount + 1 };
}
