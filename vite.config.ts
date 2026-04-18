import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import Sitemap from "vite-plugin-sitemap";
import { allApartments } from "./src/data/appData";
import { BLOG_ARTICLES } from "./src/lib/blog-data.generated";

const LOCALES = ["fr", "en", "ar"] as const;
const STATIC_PATHS = ["", "/apartments", "/gallery", "/contact", "/reglement", "/blog"];
const APT_PATHS = allApartments.map((a) => `/apartments/${a.slug}`);
const baseSitemap = LOCALES.flatMap((lang) =>
  [...STATIC_PATHS, ...APT_PATHS].map((p) => `/${lang}${p}`),
);
const blogSitemap = BLOG_ARTICLES.map((a) => `/${a.lang}/blog/${a.slug}`);
const sitemapRoutes = [...baseSitemap, ...blogSitemap];

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/",
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    Sitemap({
      hostname: "https://residence-oasis.com",
      dynamicRoutes: sitemapRoutes,
      exclude: ["/__spa-fallback", "/"],
      changefreq: "weekly",
      outDir: "build/client",
      readable: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
