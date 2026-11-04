// Checks the "add a dog" form before it goes to Supabase.

export type DogInput = { name: string; breed: string | null; weightLb: number };

export type DogValidation = { ok: true; dog: DogInput } | { ok: false; error: string };

export const MAX_WEIGHT_LB = 300;

export function validateDog(raw: { name: string; breed: string; weight: string }): DogValidation {
  const name = raw.name.trim();
  if (!name) return { ok: false, error: "Please enter your dog's name." };

  const weightText = raw.weight.trim();
  if (!weightText) return { ok: false, error: "Please enter your dog's weight in pounds." };

  const weightLb = Number(weightText);
  if (!Number.isFinite(weightLb)) return { ok: false, error: "Weight must be a number, like 65." };
  if (weightLb <= 0) return { ok: false, error: "Weight must be more than 0 lb." };
  if (weightLb > MAX_WEIGHT_LB) return { ok: false, error: `Weight must be ${MAX_WEIGHT_LB} lb or less.` };

  const breed = raw.breed.trim() || null;
  return { ok: true, dog: { name, breed, weightLb } };
}
