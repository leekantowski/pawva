// Reads Apple Health "workout-routes" GPX files and turns each into summary numbers.
// Runs in the BROWSER (files never leave the device; only the summary is sent to the server).
// Pure functions with no DOM dependency, so they also run in unit tests.

import { APP_TIME_ZONE } from "@/lib/dashboard/stats";

export type TrackPoint = { lat: number; lon: number; time: number | null }; // time = ms since epoch

export type GpxSummary = {
  startedAt: string; // ISO timestamp of the first point, e.g. "2026-10-05T15:03:21.000Z"
  walkedOn: string; // YYYY-MM-DD in California time
  startTimeLabel: string; // e.g. "8:03 AM" in California time
  distanceMi: number; // rounded to 0.01
  durationMin: number; // first → last timestamp, rounded to 0.1
  points: number;
};

export type GpxResult = { ok: true; summary: GpxSummary } | { ok: false; error: string };

const EARTH_RADIUS_MI = 3958.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two GPS points, in miles (haversine formula). */
export function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total distance along the route: the sum of the gaps between consecutive points. */
export function trackDistanceMiles(points: { lat: number; lon: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversineMiles(points[i - 1], points[i]);
  return total;
}

/** Minutes from the first timestamp to the last (pauses included — it's elapsed time). */
export function trackDurationMinutes(points: { time: number | null }[]): number | null {
  const range = timeRange(points);
  return range && range.count >= 2 ? (range.last - range.first) / 60000 : null;
}

/** Earliest and latest timestamps. A loop, not Math.min(...), so huge files don't overflow the call stack. */
export function timeRange(points: { time: number | null }[]): { first: number; last: number; count: number } | null {
  let first = Infinity;
  let last = -Infinity;
  let count = 0;
  for (const { time } of points) {
    if (time === null) continue;
    if (time < first) first = time;
    if (time > last) last = time;
    count++;
  }
  return count > 0 ? { first, last, count } : null;
}

const attr = (attrs: string, name: string) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`).exec(attrs);
  return m ? Number(m[1]) : NaN;
};

/**
 * Pulls track points out of GPX text. Uses a small, fast scanner instead of a full XML parser,
 * because Apple's route files can have tens of thousands of points.
 */
export function extractTrackPoints(gpxText: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  const re = /<trkpt\b([^>]*?)(\/>|>([\s\S]*?)<\/trkpt>)/g;
  for (let m = re.exec(gpxText); m; m = re.exec(gpxText)) {
    const lat = attr(m[1], "lat");
    const lon = attr(m[1], "lon");
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const timeText = m[3] ? /<time>\s*([^<\s]+)\s*<\/time>/.exec(m[3])?.[1] : undefined;
    const time = timeText ? Date.parse(timeText) : NaN;
    points.push({ lat, lon, time: Number.isFinite(time) ? time : null });
  }
  return points;
}

/** Date (YYYY-MM-DD) and start time ("8:03 AM") of a moment, in California time. */
export function localDateAndTime(ms: number, timeZone = APP_TIME_ZONE): { date: string; time: string } {
  const d = new Date(ms);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(d);
  return { date, time };
}

/** Reads one GPX file's text into its summary, or a friendly error. Never throws. */
export function summarizeGpx(gpxText: string): GpxResult {
  if (!/<gpx\b/i.test(gpxText)) {
    return { ok: false, error: "This doesn't look like a GPX file." };
  }
  const points = extractTrackPoints(gpxText);
  if (points.length < 2) {
    return { ok: false, error: "No route found in this file (it needs at least two GPS points)." };
  }

  const range = timeRange(points);
  const durationMin = trackDurationMinutes(points);
  if (!range || durationMin === null) {
    return { ok: false, error: "This file has no timestamps, so the date and duration can't be worked out." };
  }

  const startMs = range.first;
  const { date, time } = localDateAndTime(startMs);
  return {
    ok: true,
    summary: {
      startedAt: new Date(startMs).toISOString(),
      walkedOn: date,
      startTimeLabel: time,
      distanceMi: Math.round(trackDistanceMiles(points) * 100) / 100,
      durationMin: Math.round(durationMin * 10) / 10,
      points: points.length,
    },
  };
}
