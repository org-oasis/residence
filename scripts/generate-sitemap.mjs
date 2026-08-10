#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allApartments } from "../src/data/appData.ts";
import { BLOG_ARTICLES } from "../src/lib/blog-data.generated.ts";

const ROOT = resolve(import.meta.dirname, "..");
const HOSTNAME = "https://residence-oasis.com";
const LOCALES = ["fr", "en", "ar"];
const STATIC_PATHS = ["", "/apartments", "/gallery", "/contact", "/reglement", "/blog"];
const LEGAL_SLUGS = ["mentions-legales", "confidentialite", "conditions"];
const LEGAL_PATHS = LEGAL_SLUGS.map((s) => `/legal/${s}`);
const APT_PATHS = allApartments.map((a) => `/apartments/${a.slug}`);

// Source files behind each localized route, used to date its <lastmod>.
// Every localized page also depends on its locale dictionary, so it is added
// on top of the route-specific sources below.
const PAGE_SOURCES = {
  "": ["src/pages/Index.tsx"],
  "/apartments": ["src/pages/Apartments.tsx", "src/data/appData.ts", "src/data/pricing.ts"],
  "/gallery": ["src/pages/Gallery.tsx", "src/data/appData.ts"],
  "/contact": ["src/pages/Contact.tsx", "src/data/appData.ts"],
  "/reglement": ["src/pages/Reglement.tsx"],
  "/blog": ["src/routes/blog-index.tsx"],
};
const APT_DETAIL_SOURCES = [
  "src/pages/ApartmentDetail.tsx",
  "src/data/appData.ts",
  "src/data/pricing.ts",
];
const LEGAL_SOURCES = ["src/pages/Legal.tsx"];

/**
 * Last commit date per tracked file, newest first from a single `git log` pass
 * (one `git log -1` per file would mean ~200 process spawns per build).
 * Returns an empty map when git is unavailable or the repo has no history —
 * callers then fall back to the build date.
 */
function lastCommitDates() {
  const dates = new Map();
  let log;
  try {
    log = execFileSync(
      "git",
      ["log", "--pretty=format:%x00%cI", "--name-only", "--no-renames"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return dates;
  }
  let commitDate = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      commitDate = line.slice(1).trim();
    } else if (line && commitDate && !dates.has(line)) {
      // First hit wins: git log walks from the newest commit down.
      dates.set(line, commitDate);
    }
  }
  return dates;
}

const COMMIT_DATES = lastCommitDates();
const BUILD_DATE = new Date().toISOString();

/** Newest commit date among the given sources, or the build date if untracked. */
function lastmodFor(sources) {
  const known = sources.map((f) => COMMIT_DATES.get(f)).filter(Boolean);
  if (known.length === 0) return BUILD_DATE;
  return known.reduce((a, b) => (a > b ? a : b));
}

const baseLocalized = LOCALES.flatMap((lang) => {
  const dict = `src/locales/${lang}.ts`;
  return [
    ...STATIC_PATHS.map((p) => ({
      path: `/${lang}${p}`,
      sources: [...PAGE_SOURCES[p], dict],
    })),
    ...APT_PATHS.map((p) => ({
      path: `/${lang}${p}`,
      sources: [...APT_DETAIL_SOURCES, dict],
    })),
    ...LEGAL_PATHS.map((p) => ({
      path: `/${lang}${p}`,
      sources: [...LEGAL_SOURCES, dict],
    })),
  ];
});
// Each article has its own markdown source, so its <lastmod> is exact.
const blogPaths = BLOG_ARTICLES.map((a) => ({
  path: `/${a.lang}/blog/${a.slug}`,
  sources: [`src/content/blog/${a.slug}/${a.lang}.md`],
}));
const routes = [...baseLocalized, ...blogPaths];

// Always emit URLs with a trailing slash — matches the prerendered file layout
// (`<lang>/<path>/index.html`) and avoids the GitHub Pages 301 (no-slash → with-slash)
// that Search Console flags as "Erreur liée à des redirections".
const withTrailingSlash = (path) => (path.endsWith("/") ? path : `${path}/`);

const urlset = routes
  .map(
    ({ path, sources }) => `  <url>
    <loc>${HOSTNAME}${withTrailingSlash(path)}</loc>
    <lastmod>${lastmodFor(sources)}</lastmod>
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

// Explicit allowlist for AI / LLM crawlers — required signal for AI-visibility
// audits (RoastMyUrl, AI Overview readiness). Implicit `User-agent: * Allow: /`
// is not enough: auditors look for per-agent entries.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "cohere-ai",
  "Applebot",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
  "DuckAssistBot",
  "YouBot",
  "Diffbot",
  "Amazonbot",
];

const aiBotBlock = AI_BOTS.map((ua) => `User-agent: ${ua}\nAllow: /\n`).join("\n");

const robots = `User-agent: *
Allow: /

${aiBotBlock}
Sitemap: ${HOSTNAME}/sitemap.xml
`;

await writeFile(resolve(ROOT, "public/sitemap.xml"), sitemap);
await writeFile(resolve(ROOT, "public/robots.txt"), robots);

const dated = routes.filter(({ sources }) => lastmodFor(sources) !== BUILD_DATE).length;
console.log(
  `Generated public/sitemap.xml (${routes.length} URLs, ${dated} dated from git) and public/robots.txt`,
);
