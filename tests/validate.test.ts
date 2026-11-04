import { describe, it, expect } from "vitest";
import { validateLogIn, validateSignUp } from "@/lib/auth/validate";

describe("validateSignUp (sign-up form)", () => {
  it("accepts a normal email and a 6+ character password", () => {
    expect(validateSignUp({ email: " lee@example.com ", password: "luna1234" })).toEqual({
      ok: true,
      value: { email: "lee@example.com", password: "luna1234" },
    });
  });

  it("shows a message next to each blank field at once", () => {
    expect(validateSignUp({ email: "", password: "" })).toEqual({
      ok: false,
      errors: { email: "Please enter your email.", password: "Please choose a password." },
    });
  });

  it("rejects something that isn't an email", () => {
    const result = validateSignUp({ email: "luna", password: "luna1234" });
    expect(result.ok === false && result.errors.email).toBe("That doesn't look like an email address.");
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = validateSignUp({ email: "lee@example.com", password: "abc" });
    expect(result.ok === false && result.errors.password).toBe("Password must be at least 6 characters.");
  });
});

describe("validateLogIn (log-in form)", () => {
  it("requires both fields", () => {
    expect(validateLogIn({ email: "", password: "" })).toEqual({
      ok: false,
      errors: { email: "Please enter your email.", password: "Please enter your password." },
    });
  });

  it("doesn't apply the sign-up length rule", () => {
    expect(validateLogIn({ email: "lee@example.com", password: "abc" }).ok).toBe(true);
  });
});
