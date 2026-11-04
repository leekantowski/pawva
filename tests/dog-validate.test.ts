import { describe, it, expect } from "vitest";
import { validateDog } from "@/lib/dogs/validate";

describe("validateDog (add-a-dog form checks)", () => {
  it("accepts a name and weight, and treats a blank breed as none", () => {
    expect(validateDog({ name: " Luna ", breed: "  ", weight: "65" })).toEqual({
      ok: true,
      dog: { name: "Luna", breed: null, weightLb: 65 },
    });
  });

  it("keeps the breed when given", () => {
    const result = validateDog({ name: "Luna", breed: "German Shepherd", weight: "65" });
    expect(result.ok && result.dog.breed).toBe("German Shepherd");
  });

  it("requires a name", () => {
    expect(validateDog({ name: "", breed: "", weight: "65" })).toEqual({
      ok: false,
      error: "Please enter your dog's name.",
    });
  });

  it("requires a weight", () => {
    expect(validateDog({ name: "Luna", breed: "", weight: "" })).toEqual({
      ok: false,
      error: "Please enter your dog's weight in pounds.",
    });
  });

  it("rejects a weight of 0 or less", () => {
    expect(validateDog({ name: "Luna", breed: "", weight: "0" })).toEqual({
      ok: false,
      error: "Weight must be more than 0 lb.",
    });
    expect(validateDog({ name: "Luna", breed: "", weight: "-5" }).ok).toBe(false);
  });

  it("rejects a weight that isn't a number", () => {
    expect(validateDog({ name: "Luna", breed: "", weight: "heavy" })).toEqual({
      ok: false,
      error: "Weight must be a number, like 65.",
    });
  });
});
