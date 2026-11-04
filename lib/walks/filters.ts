// Search / date range / sort for the /walks page. Everything lives in the URL
// (e.g. /walks?view=starred&q=park&from=2026-10-01&to=2026-10-31&sort=distance),
// so a refresh or a shared link shows the same list. Pure functions — easy to test.
import { parseWalksView, type WalksView } from "@/lib/walks/view";

export const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  distance: "Longest distance",
  calories: "Most calories",
} as const;

export type WalkSort = keyof typeof SORTS;

export type WalkFilters = {
  view: WalksView;
  q: string; // matches notes, case-insensitive
  from: string; // YYYY-MM-DD or ""
  to: string; // YYYY-MM-DD or ""
  sort: WalkSort;
};

export const DEFAULT_FILTERS: WalkFilters = { view: "all", q: "", from: "", to: "", sort: "newest" };

export const MAX_SEARCH_LENGTH = 100;

type RawParams = { [key: string]: string | string[] | undefined };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function realDateOrEmpty(raw: string): string {
  const value = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value ? value : "";
}

/**
 * Reads filters from the URL. Anything invalid falls back to "no filter" rather than an error,
 * and a from-date after the to-date is swapped so the range still makes sense.
 */
export function parseWalkFilters(params: RawParams): WalkFilters {
  let from = realDateOrEmpty(first(params.from));
  let to = realDateOrEmpty(first(params.to));
  if (from && to && from > to) [from, to] = [to, from];

  const sortRaw = first(params.sort);
  const sort: WalkSort = sortRaw in SORTS ? (sortRaw as WalkSort) : "newest";

  return {
    view: parseWalksView(params.view),
    q: first(params.q).trim().slice(0, MAX_SEARCH_LENGTH),
    from,
    to,
    sort,
  };
}

/** Builds a /walks URL, leaving out defaults so URLs stay short. */
export function walksHref(filters: WalkFilters, changes: Partial<WalkFilters> = {}): string {
  const f = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (f.view !== "all") params.set("view", f.view);
  if (f.q) params.set("q", f.q);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (f.sort !== "newest") params.set("sort", f.sort);
  const query = params.toString();
  return query ? `/walks?${query}` : "/walks";
}

/** True when search or dates are set (sort and the Starred tab don't count as "filtering"). */
export function isFiltering(f: WalkFilters): boolean {
  return Boolean(f.q || f.from || f.to);
}

/** Database ordering for each sort option; ties fall back to newest first. */
export function sortOrder(sort: WalkSort): { column: string; ascending: boolean }[] {
  const newestTieBreak = [
    { column: "walked_on", ascending: false },
    { column: "created_at", ascending: false },
  ];
  switch (sort) {
    case "oldest":
      return [
        { column: "walked_on", ascending: true },
        { column: "created_at", ascending: true },
      ];
    case "distance":
      return [{ column: "distance_mi", ascending: false }, ...newestTieBreak];
    case "calories":
      return [{ column: "calories_est", ascending: false }, ...newestTieBreak];
    default:
      return newestTieBreak;
  }
}

/**
 * Turns search text into a case-insensitive "contains" pattern for SQL ILIKE.
 * %, _ and \ are escaped so they're matched literally ("100%" finds "100%", not everything).
 */
export function notesPattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
