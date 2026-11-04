import { describe, it, expect } from "vitest";
import { parseWalksView } from "@/lib/walks/view";
import { isStarred } from "@/lib/walks/queries";

describe("parseWalksView (which list /walks shows)", () => {
  it("shows only starred walks for ?view=starred", () => {
    expect(parseWalksView("starred")).toBe("starred");
  });

  it("shows all walks by default or for anything unexpected", () => {
    expect(parseWalksView(undefined)).toBe("all");
    expect(parseWalksView("everything")).toBe("all");
    expect(parseWalksView(["starred", "all"])).toBe("starred");
  });
});

describe("isStarred", () => {
  it("is true when the walk has my star", () => {
    expect(isStarred({ stars: [{ walk_id: 3 }] })).toBe(true);
  });

  it("is false when it doesn't", () => {
    expect(isStarred({ stars: [] })).toBe(false);
  });
});
