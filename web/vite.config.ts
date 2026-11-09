import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH is set by the GitHub Pages workflow (e.g. /Ingredi_v2/). Locally it stays "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});
