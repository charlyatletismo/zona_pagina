import path from "path"
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so tests don't load the Cloudflare/router plugins
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src/react-app"),
      "@shared": path.resolve(import.meta.dirname, "./src/shared"),
    },
  },
  test: {
    include: ["src/react-app/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
