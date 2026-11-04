// Pure helpers for the walk form and walk display. No Supabase here, so they're easy to test.

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function readWalkForm(formData: FormData): WalkFormValues {
  const get = (key: keyof WalkFormValues) => String(formData.get(key) ?? "");
  return {
    walked_on: get("walked_on"),
    dog_id: get("dog_id"),
    distance_mi: get("distance_mi"),
    duration_min: get("duration_min"),
    notes: get("notes"),
  };
}

/**
 * Turns raw form values into a walk, or null if something required is missing or invalid.
 * (Feature 4 replaces the null with a friendly, field-specific message.)
 */
export function parseWalkForm(values: WalkFormValues): WalkInput | null {
  const walked_on = values.walked_on.trim();
  if (!DATE_PATTERN.test(walked_on)) return null;

  const dog_id = Number(values.dog_id);
  if (!Number.isInteger(dog_id) || dog_id <= 0) return null;

  if (!values.distance_mi.trim() || !values.duration_min.trim()) return null;
  const distance_mi = Number(values.distance_mi);
  const duration_min = Number(values.duration_min);
  if (!Number.isFinite(distance_mi) || distance_mi <= 0) return null;
  if (!Number.isFinite(duration_min) || duration_min <= 0) return null;

  const notes = values.notes.trim() || null;
  return { walked_on, dog_id, distance_mi, duration_min, notes };
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
