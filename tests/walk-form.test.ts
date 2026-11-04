import { describe, it, expect } from "vitest";
import {
  formatPace,
  formatWalkDate,
  parseWalkId,
  shouldRecalculateCalories,
  validateWalk,
  type WalkFormValues,
} from "@/lib/walks/form";

const valid: WalkFormValues = {
  walked_on: "2026-11-04",
  dog_id: "7",
  distance_mi: "2.0",
  duration_min: "40",
  notes: "  Tilden loop  ",
};

describe("validateWalk (walk form: the feature 4 user story)", () => {
  it("accepts a complete walk and trims the notes", () => {
    expect(validateWalk(valid)).toEqual({
      ok: true,
      value: { walked_on: "2026-11-04", dog_id: 7, distance_mi: 2, duration_min: 40, notes: "Tilden loop" },
    });
  });

  it("saves blank notes as no notes", () => {
    const result = validateWalk({ ...valid, notes: "   " });
    expect(result.ok && result.value.notes).toBeNull();
  });

  it("shows a friendly message next to each blank required field at once", () => {
    expect(validateWalk({ walked_on: "", dog_id: "", distance_mi: "", duration_min: "", notes: "" })).toEqual({
      ok: false,
      errors: {
        walked_on: "Please pick the date of the walk.",
        dog_id: "Please choose a dog.",
        distance_mi: "Please enter the distance.",
        duration_min: "Please enter the duration.",
      },
    });
  });

  it("rejects a distance or duration of 0 or less", () => {
    expect(validateWalk({ ...valid, distance_mi: "0", duration_min: "-5" })).toEqual({
      ok: false,
      errors: {
        distance_mi: "Distance must be more than 0 miles.",
        duration_min: "Duration must be more than 0 minutes.",
      },
    });
  });

  it("only flags the field that's wrong", () => {
    expect(validateWalk({ ...valid, duration_min: "" })).toEqual({
      ok: false,
      errors: { duration_min: "Please enter the duration." },
    });
  });

  it("rejects a date that doesn't exist", () => {
    const result = validateWalk({ ...valid, walked_on: "2026-02-30" });
    expect(result.ok === false && result.errors.walked_on).toBe("Please enter a real date.");
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
