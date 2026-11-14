/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Recharts macht das Paket groß (ca. 185 KB gezippt). Für einen Prototyp ohne Code-Splitting okay.
    chunkSizeWarningLimit: 700,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
