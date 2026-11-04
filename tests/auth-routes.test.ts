import { describe, it, expect } from "vitest";
import { authRedirect } from "@/lib/auth/routes";

describe("authRedirect (who is allowed on which page)", () => {
  it("sends a logged-out visitor on /walks to /login", () => {
    expect(authRedirect("/walks", false)).toBe("/login");
  });

  it("also protects pages nested under /walks", () => {
    expect(authRedirect("/walks/42", false)).toBe("/login");
  });

  it("sends a logged-out visitor on /dogs to /login", () => {
    expect(authRedirect("/dogs", false)).toBe("/login");
  });

  it("sends a logged-out visitor on /dashboard to /login", () => {
    expect(authRedirect("/dashboard", false)).toBe("/login");
  });

  it("lets a logged-in user see /walks", () => {
    expect(authRedirect("/walks", true)).toBeNull();
  });

  it("sends a logged-in user away from /login and /signup to /walks", () => {
    expect(authRedirect("/login", true)).toBe("/walks");
    expect(authRedirect("/signup", true)).toBe("/walks");
  });

  it("lets logged-out visitors see the public pages", () => {
    expect(authRedirect("/", false)).toBeNull();
    expect(authRedirect("/login", false)).toBeNull();
    expect(authRedirect("/signup", false)).toBeNull();
  });

  it("doesn't confuse look-alike paths with /walks", () => {
    expect(authRedirect("/walkscape", false)).toBeNull();
  });
});
