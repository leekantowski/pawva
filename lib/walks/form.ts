// Pure helpers for the walk form and walk display. No Supabase here, so they're easy to test.
import { hasErrors, positiveNumber, readFields, type FieldErrors, type Validation } from "@/lib/validation";

export type WalkFormValues = {
  walked_on: string;
  dog_id: string;
  distance_mi: string;
  duration_min: string;
  notes: string;
};

export type WalkInput = {
  walked_on: string; // YYYY-MM-DD
  dog_id: number;
  distance_mi: number;
  duration_min: number;
  notes: string | null;
};

export const EMPTY_WALK_FORM: WalkFormValues = {
  walked_on: "",
  dog_id: "",
  distance_mi: "",
  duration_min: "",
  notes: "",
};

export type WalkFields = keyof WalkFormValues;

export const MAX_DISTANCE_MI = 1000;
export const MAX_DURATION_MIN = 1440; // 24 hours

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date like 2026-11-04 (rejects 2026-02-30). */
function isRealDate(iso: string): boolean {
  if (!DATE_PATTERN.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

export function readWalkForm(formData: FormData): WalkFormValues {
  return readFields(formData, WALK_FIELDS);
}

const WALK_FIELDS = ["walked_on", "dog_id", "distance_mi", "duration_min", "notes"] as const;

/**
 * Checks the walk form: date, dog, distance and duration are required;
 * distance and duration must be numbers > 0. One friendly message per field.
 * Used in the browser and again in the Server Action.
 */
export function validateWalk(values: WalkFormValues): Validation<WalkInput, WalkFields> {
  const errors: FieldErrors<WalkFields> = {};

  const walked_on = values.walked_on.trim();
  if (!walked_on) errors.walked_on = "Please pick the date of the walk.";
  else if (!isRealDate(walked_on)) errors.walked_on = "Please enter a real date.";

  const dog_id = Number(values.dog_id);
  if (!values.dog_id.trim() || !Number.isInteger(dog_id) || dog_id <= 0) errors.dog_id = "Please choose a dog.";

  const distance = positiveNumber(values.distance_mi, {
    label: "distance",
    unit: "miles",
    example: "1.5",
    max: { value: MAX_DISTANCE_MI, text: `${MAX_DISTANCE_MI.toLocaleString("en-US")} miles or less` },
  });
  if ("error" in distance) errors.distance_mi = distance.error;

  const duration = positiveNumber(values.duration_min, {
    label: "duration",
    unit: "minutes",
    example: "30",
    max: { value: MAX_DURATION_MIN, text: `${MAX_DURATION_MIN.toLocaleString("en-US")} minutes (24 hours) or less` },
  });
  if ("error" in duration) errors.duration_min = duration.error;

  if (hasErrors(errors) || "error" in distance || "error" in duration) return { ok: false, errors };
  return {
    ok: true,
    value: {
      walked_on,
      dog_id,
      distance_mi: distance.value,
      duration_min: duration.value,
      notes: values.notes.trim() || null,
    },
  };
}

/**
 * On edit, recalculate calories only if the dog or distance changed.
 * Otherwise keep the estimate from when the walk was first saved (PLAN.md design decision).
 */
export function shouldRecalculateCalories(
  before: { dog_id: number; distance_mi: number },
  after: { dog_id: number; distance_mi: number },
): boolean {
  return before.dog_id !== after.dog_id || Number(before.distance_mi) !== Number(after.distance_mi);
}

/** Pace as "m:ss /mi", e.g. 30 min over 2 mi → "15:00 /mi". */
export function formatPace(distanceMi: number, durationMin: number): string {
  if (!(distanceMi > 0) || !(durationMin > 0)) return "–";
  const totalSeconds = Math.round((durationMin / distanceMi) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} /mi`;
}

/** "2026-11-04" → "Wed, Nov 4, 2026". Uses UTC so the date never shifts by time zone. */
export function formatWalkDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Turns a URL segment like "42" into a walk id, or null. */
export function parseWalkId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
