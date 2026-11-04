import { describe, it, expect } from "vitest";
import { validateCredentials } from "@/lib/auth/validate";

describe("validateCredentials (sign-up form checks)", () => {
  it("accepts a normal email and a 6+ character password", () => {
    expect(validateCredentials("lee@example.com", "luna1234")).toBeNull();
  });

  it("asks for an email when it's blank", () => {
    expect(validateCredentials("   ", "luna1234")).toBe("Please enter your email.");
  });

  it("rejects something that isn't an email", () => {
    expect(validateCredentials("luna", "luna1234")).toBe("That doesn't look like an email address.");
  });

  it("asks for a password when it's blank", () => {
    expect(validateCredentials("lee@example.com", "")).toBe("Please enter your password.");
  });

  it("rejects a password shorter than 6 characters", () => {
    expect(validateCredentials("lee@example.com", "abc")).toBe(
      "Password must be at least 6 characters.",
    );
  });
});
