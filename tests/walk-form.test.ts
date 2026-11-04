import { describe, it, expect } from "vitest";
import {
  formatPace,
  formatWalkDate,
  parseWalkForm,
  parseWalkId,
  shouldRecalculateCalories,
  type WalkFormValues,
} from "@/lib/walks/form";

const valid: WalkFormValues = {
  walked_on: "2026-11-04",
  dog_id: "7",
  distance_mi: "2.0",
  duration_min: "40",
  notes: "  Tilden loop  ",
};

describe("parseWalkForm (turning the walk form into a walk)", () => {
  it("parses a complete walk and trims the notes", () => {
    expect(parseWalkForm(valid)).toEqual({
      walked_on: "2026-11-04",
      dog_id: 7,
      distance_mi: 2,
      duration_min: 40,
      notes: "Tilden loop",
    });
  });

  it("saves blank notes as no notes", () => {
    expect(parseWalkForm({ ...valid, notes: "   " })?.notes).toBeNull();
  });

  it("rejects a walk with a missing date, dog, distance, or duration", () => {
    expect(parseWalkForm({ ...valid, walked_on: "" })).toBeNull();
    expect(parseWalkForm({ ...valid, dog_id: "" })).toBeNull();
    expect(parseWalkForm({ ...valid, distance_mi: "" })).toBeNull();
    expect(parseWalkForm({ ...valid, duration_min: "" })).toBeNull();
  });

  it("rejects a distance or duration of 0 or less", () => {
    expect(parseWalkForm({ ...valid, distance_mi: "0" })).toBeNull();
    expect(parseWalkForm({ ...valid, duration_min: "-5" })).toBeNull();
  });
});

describe("shouldRecalculateCalories (editing a walk)", () => {
  const before = { dog_id: 7, distance_mi: 2 };

  it("keeps the saved estimate when only notes or date change", () => {
    expect(shouldRecalculateCalories(before, { dog_id: 7, distance_mi: 2 })).toBe(false);
  });

  it("recalculates when the distance changes", () => {
    expect(shouldRecalculateCalories(before, { dog_id: 7, distance_mi: 2.5 })).toBe(true);
  });

  it("recalculates when the dog changes", () => {
    expect(shouldRecalculateCalories(before, { dog_id: 8, distance_mi: 2 })).toBe(true);
  });
});

describe("formatPace (minutes per mile)", () => {
  it("shows 40 minutes over 2 miles as 20:00 /mi", () => {
    expect(formatPace(2, 40)).toBe("20:00 /mi");
  });

  it("shows seconds with two digits", () => {
    expect(formatPace(1.5, 28)).toBe("18:40 /mi");
  });
});

describe("formatWalkDate", () => {
  it("shows the same calendar day it was saved as", () => {
    expect(formatWalkDate("2026-11-04")).toBe("Wed, Nov 4, 2026");
  });
});

describe("parseWalkId (walk id from the URL)", () => {
  it("accepts a positive whole number", () => {
    expect(parseWalkId("42")).toBe(42);
  });

  it("rejects anything else", () => {
    expect(parseWalkId("abc")).toBeNull();
    expect(parseWalkId("0")).toBeNull();
    expect(parseWalkId("4.2")).toBeNull();
  });
});
