#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allApartments } from "../src/data/appData.ts";
import { BLOG_ARTICLES } from "../src/lib/blog-data.generated.ts";

const ROOT = resolve(import.meta.dirname, "..");
const HOSTNAME = "https://residence-oasis.com";
const LOCALES = ["fr", "en", "ar"];
const STATIC_PATHS = ["", "/apartments", "/gallery", "/contact", "/reglement", "/blog"];
const APT_PATHS = allApartments.map((a) => `/apartments/${a.slug}`);

const baseLocalized = LOCALES.flatMap((lang) =>
  [...STATIC_PATHS, ...APT_PATHS].map((p) => `/${lang}${p}`),
);
const blogPaths = BLOG_ARTICLES.map((a) => `/${a.lang}/blog/${a.slug}`);
const routes = [...baseLocalized, ...blogPaths];

const today = new Date().toISOString().slice(0, 10);

const urlset = routes
  .map(
    (path) => `  <url>
    <loc>${HOSTNAME}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${HOSTNAME}/sitemap.xml
`;

await writeFile(resolve(ROOT, "public/sitemap.xml"), sitemap);
await writeFile(resolve(ROOT, "public/robots.txt"), robots);

console.log(`Generated public/sitemap.xml (${routes.length} URLs) and public/robots.txt`);
