// Shared building blocks for form validation.
// Every form uses these on BOTH sides: in the browser (instant feedback) and in the
// Server Action (the real gatekeeper — browser checks can be bypassed).

/** One friendly message per field, e.g. { distance_mi: "Please enter the distance." } */
export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export type Validation<T, K extends string> = { ok: true; value: T } | { ok: false; errors: FieldErrors<K> };

/** State every form's Server Action returns. `values` echoes the user's input so nothing is lost. */
export type FormState<V, K extends string = Extract<keyof V, string>> = {
  formError: string | null; // problems not tied to one field, e.g. "Email or password is incorrect."
  fieldErrors: FieldErrors<K>;
  values: V;
};

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Reads text fields from FormData; missing fields become "". */
export function readFields<K extends string>(formData: FormData, keys: readonly K[]): Record<K, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")])) as Record<K, string>;
}

type NumberRules = {
  /** Lower-case label used in messages, e.g. "distance". */
  label: string;
  /** Unit for the "> 0" message, e.g. "miles". */
  unit: string;
  /** Example shown when the input isn't a number, e.g. "1.5". */
  example: string;
  /** Inclusive maximum, and how to say it, e.g. { value: 300, text: "300 lb or less" }. */
  max?: { value: number; text: string };
  /** Message for a blank field (defaults to "Please enter the <label>."). */
  requiredMessage?: string;
};

/** Required number that must be > 0. Returns the number, or a friendly message. */
export function positiveNumber(raw: string, rules: NumberRules): { value: number } | { error: string } {
  const text = raw.trim();
  const Label = rules.label[0].toUpperCase() + rules.label.slice(1);
  if (!text) return { error: rules.requiredMessage ?? `Please enter the ${rules.label}.` };

  const value = Number(text);
  if (!Number.isFinite(value)) return { error: `${Label} must be a number, like ${rules.example}.` };
  if (value <= 0) return { error: `${Label} must be more than 0 ${rules.unit}.` };
  if (rules.max && value > rules.max.value) return { error: `${Label} must be ${rules.max.text}.` };
  return { value };
}
