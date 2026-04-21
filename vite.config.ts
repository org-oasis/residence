import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Sitemap and robots.txt are generated in the prebuild step by
// scripts/generate-sitemap.mjs, which writes into public/ and is then
// copied into build/client/ by Vite's static asset handling. This replaces
// vite-plugin-sitemap, whose closeBundle hook fired before react-router v7
// created build/client/ and so crashed the build with ENOENT.

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/",
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
