import path from "path"
import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";

export default defineConfig(async () => {
  // Seeds are left out: each test inserts the fixtures it needs
  const migrations = (await readD1Migrations(path.join(import.meta.dirname, "drizzle")))
    .filter((m) => !m.name.includes("_z_initial_"));

  return {
    plugins: [
      cloudflareTest({
        // The pool gives every test file its own in-memory D1 for the DB binding,
        // never the local or remote database
        wrangler: { configPath: "./wrangler.json" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            MERCADOPAGO_ACCESS_TOKEN: "test-access-token",
            MERCADOPAGO_SECRET_KEY: "test-secret-key",
          },
        },
      }),
    ],
    resolve: {
      alias: {
        "@shared": path.resolve(import.meta.dirname, "./src/shared"),
      },
    },
    test: {
      include: ["tests/**/*.test.ts"],
      setupFiles: ["./tests/setup.ts"],
    },
  };
});
