import { describe, it, expect } from "vitest";
import { DEFAULT_FILTERS, notesPattern, parseWalkFilters, sortOrder, walksHref } from "@/lib/walks/filters";

describe("parseWalkFilters (reading search, dates and sort from the URL)", () => {
  it("uses no filters and newest-first when the URL has none", () => {
    expect(parseWalkFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it("reads every filter, combined with the Starred tab", () => {
    expect(
      parseWalkFilters({ view: "starred", q: "  Tilden ", from: "2026-10-01", to: "2026-10-31", sort: "distance" }),
    ).toEqual({ view: "starred", q: "Tilden", from: "2026-10-01", to: "2026-10-31", sort: "distance" });
  });

  it("ignores dates that aren't real and unknown sorts", () => {
    expect(parseWalkFilters({ from: "2026-02-30", to: "yesterday", sort: "random" })).toEqual(DEFAULT_FILTERS);
  });

  it("swaps a from-date that's after the to-date", () => {
    const f = parseWalkFilters({ from: "2026-11-30", to: "2026-11-01" });
    expect([f.from, f.to]).toEqual(["2026-11-01", "2026-11-30"]);
  });

  it("caps very long searches at 100 characters", () => {
    expect(parseWalkFilters({ q: "a".repeat(500) }).q).toHaveLength(100);
  });
});

describe("walksHref (keeping filters in the URL)", () => {
  it("is just /walks with no filters", () => {
    expect(walksHref(DEFAULT_FILTERS)).toBe("/walks");
  });

  it("puts every non-default filter in the URL", () => {
    expect(
      walksHref({ view: "starred", q: "rain & mud", from: "2026-10-01", to: "2026-10-31", sort: "calories" }),
    ).toBe("/walks?view=starred&q=rain+%26+mud&from=2026-10-01&to=2026-10-31&sort=calories");
  });

  it("round-trips: parsing the URL it builds gives the same filters back", () => {
    const filters = { view: "starred", q: "park", from: "2026-10-01", to: "", sort: "oldest" } as const;
    const params = Object.fromEntries(new URL(walksHref(filters), "http://x").searchParams);
    expect(parseWalkFilters(params)).toEqual(filters);
  });

  it("switching tabs keeps the search, dates and sort", () => {
    const filters = parseWalkFilters({ q: "park", sort: "distance" });
    expect(walksHref(filters, { view: "starred" })).toBe("/walks?view=starred&q=park&sort=distance");
  });
});

describe("sortOrder (how each sort option orders walks)", () => {
  it("newest first by date, then by when it was logged", () => {
    expect(sortOrder("newest")).toEqual([
      { column: "walked_on", ascending: false },
      { column: "created_at", ascending: false },
    ]);
  });

  it("oldest first is the reverse", () => {
    expect(sortOrder("oldest")[0]).toEqual({ column: "walked_on", ascending: true });
  });

  it("longest distance and most calories sort biggest first, ties newest first", () => {
    expect(sortOrder("distance")[0]).toEqual({ column: "distance_mi", ascending: false });
    expect(sortOrder("calories")[0]).toEqual({ column: "calories_est", ascending: false });
    expect(sortOrder("calories")[1]).toEqual({ column: "walked_on", ascending: false });
  });
});

describe("notesPattern (search text → 'notes contain this')", () => {
  it("matches the text anywhere in the notes", () => {
    expect(notesPattern("park")).toBe("%park%");
  });

  it("treats %, _ and \\ as plain characters, not wildcards", () => {
    expect(notesPattern("100%_done\\")).toBe("%100\\%\\_done\\\\%");
  });
});
