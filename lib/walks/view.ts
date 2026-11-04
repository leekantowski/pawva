// Which list the /walks page shows: everything, or only starred walks (/walks?view=starred).

export type WalksView = "all" | "starred";

export function parseWalksView(raw: string | string[] | undefined): WalksView {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "starred" ? "starred" : "all";
}
