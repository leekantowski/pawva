// Turns parsed GPX files into preview-table rows: ready to import, already imported,
// a repeat within this batch, unusable numbers, or a file that couldn't be read.
import type { GpxResult, GpxSummary } from "@/lib/gpx/parse";
import { MAX_DISTANCE_MI, MAX_DURATION_MIN } from "@/lib/walks/form";

/** Most walks one import can save at once. */
export const MAX_IMPORT_BATCH = 500;

export type PreviewStatus = "ready" | "duplicate" | "invalid" | "error";

export type PreviewRow = {
  id: string; // stable key: file name + index
  fileName: string;
  status: PreviewStatus;
  note: string | null; // friendly explanation for anything not "ready"
  summary: GpxSummary | null;
  checked: boolean; // ticked by default only when ready
};

/** Same moment, regardless of how the timestamp is written ("…Z" vs "…+00:00"). */
const instant = (iso: string) => Date.parse(iso);

export function buildPreviewRows(
  files: { name: string; result: GpxResult }[],
  existingStartedAt: string[],
): PreviewRow[] {
  const existing = new Set(existingStartedAt.map(instant));
  const seenInBatch = new Map<number, string>(); // start instant → first file name

  return files.map(({ name, result }, i): PreviewRow => {
    const base = { id: `${i}:${name}`, fileName: name };
    if (!result.ok) return { ...base, status: "error", note: result.error, summary: null, checked: false };

    const s = result.summary;
    const start = instant(s.startedAt);

    if (existing.has(start)) {
      return { ...base, status: "duplicate", note: "Already imported", summary: s, checked: false };
    }
    const firstFile = seenInBatch.get(start);
    if (firstFile) {
      return { ...base, status: "duplicate", note: `Same workout as ${firstFile}`, summary: s, checked: false };
    }
    seenInBatch.set(start, name);

    const problem = usabilityProblem(s);
    if (problem) return { ...base, status: "invalid", note: problem, summary: s, checked: false };

    return { ...base, status: "ready", note: null, summary: s, checked: true };
  });
}

/** Same limits as a manually logged walk (feature 4), so imports can't save numbers a form would reject. */
export function usabilityProblem(s: Pick<GpxSummary, "distanceMi" | "durationMin">): string | null {
  if (!(s.distanceMi > 0)) return "Too short to log (0 miles)";
  if (!(s.durationMin > 0)) return "Too short to log (0 minutes)";
  if (s.distanceMi > MAX_DISTANCE_MI) return `Longer than ${MAX_DISTANCE_MI.toLocaleString("en-US")} miles`;
  if (s.durationMin > MAX_DURATION_MIN) return "Longer than 24 hours";
  return null;
}
