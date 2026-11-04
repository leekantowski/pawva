import { describe, it, expect } from "vitest";
import { positiveNumber } from "@/lib/validation";

const distance = { label: "distance", unit: "miles", example: "1.5", max: { value: 1000, text: "1,000 miles or less" } };

describe("positiveNumber (the shared 'number > 0' rule every form uses)", () => {
  it("accepts a number above 0", () => {
    expect(positiveNumber("2.5", distance)).toEqual({ value: 2.5 });
  });

  it("says the field is required when blank", () => {
    expect(positiveNumber("  ", distance)).toEqual({ error: "Please enter the distance." });
  });

  it("rejects text that isn't a number", () => {
    expect(positiveNumber("far", distance)).toEqual({ error: "Distance must be a number, like 1.5." });
  });

  it("rejects 0 and negative numbers", () => {
    expect(positiveNumber("0", distance)).toEqual({ error: "Distance must be more than 0 miles." });
    expect(positiveNumber("-3", distance)).toEqual({ error: "Distance must be more than 0 miles." });
  });

  it("rejects numbers over the maximum", () => {
    expect(positiveNumber("5000", distance)).toEqual({ error: "Distance must be 1,000 miles or less." });
  });
});
