import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Integration tests against the REAL Supabase project (no mocks).
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and two test accounts in env — see tests/integration/README.md.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
