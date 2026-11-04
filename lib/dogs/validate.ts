// "Add a dog" checks. Used in the browser and again in the Server Action.
import { hasErrors, positiveNumber, type FieldErrors, type Validation } from "@/lib/validation";

export type DogFields = "name" | "breed" | "weight";
export type DogFormValues = Record<DogFields, string>;
export type DogInput = { name: string; breed: string | null; weightLb: number };

export const MAX_WEIGHT_LB = 300;
export const MAX_NAME_LENGTH = 50;

export function validateDog(raw: DogFormValues): Validation<DogInput, DogFields> {
  const errors: FieldErrors<DogFields> = {};

  const name = raw.name.trim();
  if (!name) errors.name = "Please enter your dog's name.";
  else if (name.length > MAX_NAME_LENGTH) errors.name = `Name must be ${MAX_NAME_LENGTH} characters or less.`;

  const weight = positiveNumber(raw.weight, {
    label: "weight",
    unit: "lb",
    example: "65",
    max: { value: MAX_WEIGHT_LB, text: `${MAX_WEIGHT_LB} lb or less` },
    requiredMessage: "Please enter your dog's weight in pounds.",
  });
  if ("error" in weight) errors.weight = weight.error;

  if (hasErrors(errors) || "error" in weight) return { ok: false, errors };
  return { ok: true, value: { name, breed: raw.breed.trim() || null, weightLb: weight.value } };
}
