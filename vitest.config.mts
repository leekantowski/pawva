import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests: no database needed. Integration tests (real Supabase) live in
// tests/integration and run with `npm run test:rls` (vitest.integration.config.mts).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/integration/**", "node_modules/**"],
  },
});
