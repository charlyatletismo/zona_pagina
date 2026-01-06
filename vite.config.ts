import path from "path"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: "./src/react-app/routes",
      generatedRouteTree: "./src/react-app/routeTree.gen.ts",
    }),
		react(),
		cloudflare(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/react-app"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  server: {
    watch: {
      ignored: ['./.wrangler/**'],
    },
  }
});
