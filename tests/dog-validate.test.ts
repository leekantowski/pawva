import { describe, it, expect } from "vitest";
import { validateDog } from "@/lib/dogs/validate";

describe("validateDog (add-a-dog form)", () => {
  it("accepts a name and weight, and treats a blank breed as none", () => {
    expect(validateDog({ name: " Luna ", breed: "  ", weight: "65" })).toEqual({
      ok: true,
      value: { name: "Luna", breed: null, weightLb: 65 },
    });
  });

  it("keeps the breed when given", () => {
    const result = validateDog({ name: "Luna", breed: "German Shepherd", weight: "65" });
    expect(result.ok && result.value.breed).toBe("German Shepherd");
  });

  it("shows a message next to each blank required field at once", () => {
    expect(validateDog({ name: "", breed: "", weight: "" })).toEqual({
      ok: false,
      errors: { name: "Please enter your dog's name.", weight: "Please enter your dog's weight in pounds." },
    });
  });

  it("rejects a weight of 0 or less", () => {
    expect(validateDog({ name: "Luna", breed: "", weight: "0" })).toEqual({
      ok: false,
      errors: { weight: "Weight must be more than 0 lb." },
    });
    expect(validateDog({ name: "Luna", breed: "", weight: "-5" }).ok).toBe(false);
  });

  it("rejects a weight that isn't a number or is too heavy", () => {
    const notNumber = validateDog({ name: "Luna", breed: "", weight: "heavy" });
    expect(notNumber.ok === false && notNumber.errors.weight).toBe("Weight must be a number, like 65.");
    const tooHeavy = validateDog({ name: "Luna", breed: "", weight: "301" });
    expect(tooHeavy.ok === false && tooHeavy.errors.weight).toBe("Weight must be 300 lb or less.");
  });
});
