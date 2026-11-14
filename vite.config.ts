/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // Die fertige Seite läuft unter noelgruber.de/customerhealth. Deshalb verweisen alle Dateien
  // im Build auf /customerhealth/... Lokal (npm run dev) bleibt alles unter "/".
  base: command === "build" ? "/customerhealth/" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    // Recharts macht das Paket groß (ca. 185 KB gezippt). Für einen Prototyp ohne Code-Splitting okay.
    chunkSizeWarningLimit: 700,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
}));
