import { describe, it, expect } from "vitest";
import {
  extractTrackPoints,
  haversineMiles,
  localDateAndTime,
  summarizeGpx,
  trackDistanceMiles,
  trackDurationMinutes,
} from "@/lib/gpx/parse";
import { buildPreviewRows } from "@/lib/gpx/preview";

const MILES_PER_DEGREE_LAT = (Math.PI / 180) * 3958.8; // ≈ 69.09

/** Builds a GPX file shaped like Apple Health's workout-routes export. */
function appleGpx(points: { lat: number; lon: number; time?: string }[]) {
  const trkpts = points
    .map(
      (p) =>
        `<trkpt lon="${p.lon}" lat="${p.lat}"><ele>52.1</ele>${p.time ? `<time>${p.time}</time>` : ""}` +
        `<extensions><speed>1.4</speed><course>2.0</course><hAcc>3.5</hAcc><vAcc>2.1</vAcc></extensions></trkpt>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Apple Health Export" xmlns="http://www.topografix.com/GPX/1/1">
 <metadata><time>2026-11-04T12:00:00Z</time></metadata>
 <trk><name>Route 2026-10-05 9:00am</name><trkseg>
${trkpts}
 </trkseg></trk>
</gpx>`;
}

/** A 1-mile walk due north from Berkeley: 11 points, 0.1 mi apart, 4 minutes apart (40 min total). */
function oneMileWalk(startIso: string) {
  const start = Date.parse(startIso);
  return Array.from({ length: 11 }, (_, i) => ({
    lat: 37.8719 + (i * 0.1) / MILES_PER_DEGREE_LAT,
    lon: -122.2585,
    time: new Date(start + i * 4 * 60_000).toISOString(),
  }));
}

describe("distance math (from GPS points)", () => {
  it("haversine: one degree of latitude is about 69.09 miles", () => {
    expect(haversineMiles({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(69.09, 2);
  });

  it("haversine: the same point is 0 miles", () => {
    expect(haversineMiles({ lat: 37.87, lon: -122.26 }, { lat: 37.87, lon: -122.26 })).toBe(0);
  });

  it("route distance adds up every segment, not just start to end", () => {
    // Out 0.5 mi and back again: 1.0 mi walked, though start and end are the same spot.
    const step = 0.5 / MILES_PER_DEGREE_LAT;
    const outAndBack = [
      { lat: 37.87, lon: -122.26 },
      { lat: 37.87 + step, lon: -122.26 },
      { lat: 37.87, lon: -122.26 },
    ];
    expect(trackDistanceMiles(outAndBack)).toBeCloseTo(1.0, 4);
  });

  it("a route with one point (or none) is 0 miles", () => {
    expect(trackDistanceMiles([{ lat: 1, lon: 1 }])).toBe(0);
    expect(trackDistanceMiles([])).toBe(0);
  });
});

describe("duration math (first to last timestamp)", () => {
  it("is the minutes between the first and last points", () => {
    const t = (min: number) => Date.parse("2026-10-05T16:00:00Z") + min * 60_000;
    expect(trackDurationMinutes([{ time: t(0) }, { time: t(12) }, { time: t(40) }])).toBe(40);
  });

  it("ignores points without a timestamp", () => {
    const t = (min: number) => Date.parse("2026-10-05T16:00:00Z") + min * 60_000;
    expect(trackDurationMinutes([{ time: t(0) }, { time: null }, { time: t(25.5) }])).toBe(25.5);
  });

  it("can't be worked out from fewer than two timestamps", () => {
    expect(trackDurationMinutes([{ time: 1 }, { time: null }])).toBeNull();
  });
});

describe("date and start time (California time)", () => {
  it("an evening walk stays on its California date, not the next UTC day", () => {
    // 02:30 UTC on Oct 6 is 7:30 PM on Oct 5 in California (daylight time).
    expect(localDateAndTime(Date.parse("2026-10-06T02:30:00Z"))).toEqual({ date: "2026-10-05", time: "7:30 PM" });
  });

  it("uses standard time after the clocks change in November", () => {
    // 16:00 UTC on Nov 10 is 8:00 AM in California (UTC−8).
    expect(localDateAndTime(Date.parse("2026-11-10T16:00:00Z"))).toEqual({ date: "2026-11-10", time: "8:00 AM" });
  });
});

describe("summarizeGpx (one Apple Health file → date, distance, duration)", () => {
  it("summarizes a 1-mile, 40-minute walk", () => {
    const result = summarizeGpx(appleGpx(oneMileWalk("2026-10-05T16:00:00Z")));
    expect(result).toEqual({
      ok: true,
      summary: {
        startedAt: "2026-10-05T16:00:00.000Z",
        walkedOn: "2026-10-05",
        startTimeLabel: "9:00 AM",
        distanceMi: 1,
        durationMin: 40,
        points: 11,
      },
    });
  });

  it("ignores the file's metadata time and reads only the route points", () => {
    expect(extractTrackPoints(appleGpx(oneMileWalk("2026-10-05T16:00:00Z")))).toHaveLength(11);
  });

  it("gives a friendly error for a file that isn't GPX", () => {
    expect(summarizeGpx("hello, I am a photo")).toEqual({ ok: false, error: "This doesn't look like a GPX file." });
  });

  it("gives a friendly error for a GPX file with no route", () => {
    const result = summarizeGpx(appleGpx([]));
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/No route found/);
  });

  it("gives a friendly error when there are no timestamps", () => {
    const result = summarizeGpx(appleGpx([{ lat: 37.87, lon: -122.26 }, { lat: 37.88, lon: -122.26 }]));
    expect(!result.ok && result.error).toMatch(/no timestamps/);
  });
});

describe("buildPreviewRows (preview table)", () => {
  const walk = (start: string) => summarizeGpx(appleGpx(oneMileWalk(start)));

  it("ticks new walks, and marks ones already in the database as 'Already imported'", () => {
    const rows = buildPreviewRows(
      [
        { name: "route_a.gpx", result: walk("2026-10-05T16:00:00Z") },
        { name: "route_b.gpx", result: walk("2026-10-06T16:00:00Z") },
      ],
      ["2026-10-06T16:00:00+00:00"], // how Supabase writes the same moment
    );
    expect(rows.map((r) => [r.status, r.checked, r.note])).toEqual([
      ["ready", true, null],
      ["duplicate", false, "Already imported"],
    ]);
  });

  it("flags the same workout picked twice in one batch", () => {
    const rows = buildPreviewRows(
      [
        { name: "route_a.gpx", result: walk("2026-10-05T16:00:00Z") },
        { name: "route_a copy.gpx", result: walk("2026-10-05T16:00:00Z") },
      ],
      [],
    );
    expect(rows[1]).toMatchObject({ status: "duplicate", checked: false, note: "Same workout as route_a.gpx" });
  });

  it("keeps going after a bad file, showing its error", () => {
    const rows = buildPreviewRows(
      [
        { name: "broken.gpx", result: summarizeGpx("not gpx") },
        { name: "route_a.gpx", result: walk("2026-10-05T16:00:00Z") },
      ],
      [],
    );
    expect(rows.map((r) => r.status)).toEqual(["error", "ready"]);
  });

  it("won't import a route with 0 distance", () => {
    const standingStill = [
      { lat: 37.87, lon: -122.26, time: "2026-10-05T16:00:00Z" },
      { lat: 37.87, lon: -122.26, time: "2026-10-05T16:10:00Z" },
    ];
    const rows = buildPreviewRows([{ name: "still.gpx", result: summarizeGpx(appleGpx(standingStill)) }], []);
    expect(rows[0]).toMatchObject({ status: "invalid", checked: false, note: "Too short to log (0 miles)" });
  });
});
