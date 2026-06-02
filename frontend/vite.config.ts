/// <reference types="node" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Dev port + proxy target are env-overridable so multiple Eureka stacks
    // can run side by side, e.g.:
    //   VITE_DEV_PORT=5174 VITE_PROXY_TARGET=http://localhost:8001 npm run dev
    port: Number(process.env.VITE_DEV_PORT) || 5173,
    proxy: {
      // /api/* → backend (FastAPI). Keeps same-origin in dev so SSE +
      // cookies behave like prod. Production deploy can fold both behind the
      // same domain or use VITE_API_BASE override.
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
        ws: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
