// Generates src/lib/blog-data.generated.ts from src/content/blog/<slug>/{fr,en,ar}.md
// Runs at prebuild (and predev). Output is git-ignored.
//
// Requires bun runtime — imports .ts modules directly (TIERS, EXTRA_PERSON_FEE).
// `bun scripts/generate-blog-data.mjs`

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { marked } from "marked";
import readingTime from "reading-time";
import { TIERS, EXTRA_PERSON_FEE } from "../src/data/pricing.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT_FILE = join(ROOT, "src", "lib", "blog-data.generated.ts");
const LOCALES = ["fr", "en", "ar"];

// ---------------------------------------------------------------
// Token replacement: dynamic prices from src/data/pricing.ts.
// Used by blog markdown via {{PRICING_TABLE}}, {{EXTRA_PERSON_NOTE}},
// {{TIER_STUDIO_EUR}}, {{EXTRA_PERSON_EUR}}, etc.
// ---------------------------------------------------------------

const fmtDzd = (n) => n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

const I18N = {
  fr: {
    headers: ["Format", "Capacité", "Tarif € / nuit", "Tarif DA / nuit"],
    persons: "pers.",
    rows: [
      { tier: "studio", label: "Studio Deluxe" },
      { tier: "f2", label: "F2 Classique / Moderne" },
      { tier: "f2jacuzzi", label: "F2 Jacuzzi & Sauna Norvégien" },
      { tier: "f3", label: "F3 Terrasse Privée" },
    ],
    extraPersonNote: `Tarifs valables pour la capacité indiquée. Possibilité d'ajouter jusqu'à <strong>${EXTRA_PERSON_FEE.maxExtra} personnes supplémentaires</strong> par appartement, moyennant un supplément de <strong>${EXTRA_PERSON_FEE.eur} €/nuit (${fmtDzd(EXTRA_PERSON_FEE.dzd)} DA)</strong> par personne.`,
  },
  en: {
    headers: ["Format", "Capacity", "Rate € / night", "Rate DA / night"],
    persons: "pax",
    rows: [
      { tier: "studio", label: "Studio Deluxe" },
      { tier: "f2", label: "F2 Classic / Modern" },
      { tier: "f2jacuzzi", label: "F2 Jacuzzi & Norwegian Sauna" },
      { tier: "f3", label: "F3 Private Terrace" },
    ],
    extraPersonNote: `Rates valid for the listed capacity. Up to <strong>${EXTRA_PERSON_FEE.maxExtra} extra guests</strong> may be added per apartment, with a surcharge of <strong>€${EXTRA_PERSON_FEE.eur}/night (${fmtDzd(EXTRA_PERSON_FEE.dzd)} DA)</strong> per person.`,
  },
  ar: {
    headers: ["الصيغة", "السعة", "السعر € / ليلة", "السعر DA / ليلة"],
    persons: "أشخاص",
    rows: [
      { tier: "studio", label: "ستوديو ديلوكس" },
      { tier: "f2", label: "F2 كلاسيكية / حديثة" },
      { tier: "f2jacuzzi", label: "F2 جاكوزي وساونا نرويجية" },
      { tier: "f3", label: "F3 تراس خاص" },
    ],
    extraPersonNote: `الأسعار للسعة المعلنة. إمكانية إضافة حتى <strong>${EXTRA_PERSON_FEE.maxExtra} أشخاص إضافيين</strong> لكل شقة، برسم إضافي قدره <strong>${EXTRA_PERSON_FEE.eur} €/ليلة (${fmtDzd(EXTRA_PERSON_FEE.dzd)} DA)</strong> للشخص الواحد.`,
  },
};

function buildPricingTable(lang) {
  const i = I18N[lang];
  const head = i.headers.map((h) => `<th>${h}</th>`).join("");
  const body = i.rows
    .map((r) => {
      const tier = TIERS[r.tier];
      return `<tr><td>${r.label}</td><td>${tier.capacity} ${i.persons}</td><td>${tier.eur} €</td><td>${fmtDzd(tier.dzd)} DA</td></tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function applyTokens(html, lang) {
  const i = I18N[lang];
  const subs = {
    "{{PRICING_TABLE}}": buildPricingTable(lang),
    "{{EXTRA_PERSON_NOTE}}": i.extraPersonNote,
    "{{EXTRA_PERSON_EUR}}": String(EXTRA_PERSON_FEE.eur),
    "{{EXTRA_PERSON_DZD}}": fmtDzd(EXTRA_PERSON_FEE.dzd),
    "{{EXTRA_PERSON_MAX}}": String(EXTRA_PERSON_FEE.maxExtra),
    "{{TIER_STUDIO_EUR}}": String(TIERS.studio.eur),
    "{{TIER_STUDIO_DZD}}": fmtDzd(TIERS.studio.dzd),
    "{{TIER_F2_EUR}}": String(TIERS.f2.eur),
    "{{TIER_F2_DZD}}": fmtDzd(TIERS.f2.dzd),
    "{{TIER_F2JACUZZI_EUR}}": String(TIERS.f2jacuzzi.eur),
    "{{TIER_F2JACUZZI_DZD}}": fmtDzd(TIERS.f2jacuzzi.dzd),
    "{{TIER_F3_EUR}}": String(TIERS.f3.eur),
    "{{TIER_F3_DZD}}": fmtDzd(TIERS.f3.dzd),
  };
  let out = html;
  for (const [token, value] of Object.entries(subs)) {
    out = out.split(token).join(value);
  }
  return out;
}

// ---------------------------------------------------------------

function listSlugs() {
  let entries = [];
  try {
    entries = readdirSync(BLOG_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}

function fileExists(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function sha256(s) {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function loadOne(slug, lang, frFallback) {
  const file = join(BLOG_DIR, slug, `${lang}.md`);
  if (!fileExists(file)) return null;
  const raw = readFileSync(file, "utf8");
  const parsed = matter(raw);
  const data = { ...(frFallback ?? {}), ...parsed.data };
  const rawHtml = marked.parse(parsed.content, { async: false });
  const bodyHtml = applyTokens(rawHtml, lang);
  // FAQ entries can also contain tokens (price references)
  const faq = (Array.isArray(data.faq) ? data.faq : []).map((f) => ({
    q: applyTokens(f.q ?? "", lang),
    a: applyTokens(f.a ?? "", lang),
  }));
  const reading = readingTime(parsed.content);
  return {
    slug,
    lang,
    title: applyTokens(data.title ?? "", lang),
    description: applyTokens(data.description ?? "", lang),
    datePublished: data.datePublished ?? "",
    dateModified: data.dateModified ?? data.datePublished ?? "",
    cluster: data.cluster ?? "",
    funnel: data.funnel ?? "",
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    heroImage: data.heroImage ?? "",
    heroAlt: data.heroAlt ?? "",
    ogImage: data.ogImage ?? data.heroImage ?? "",
    faq,
    bodyHtml,
    readingMinutes: Math.max(1, Math.ceil(reading.minutes)),
    sourceHash: lang === "fr" ? sha256(parsed.content) : (data.sourceHash ?? null),
  };
}

const articles = [];
for (const slug of listSlugs()) {
  // fr is canonical; load it first to use as fallback for shared frontmatter fields
  const fr = loadOne(slug, "fr", null);
  if (!fr) continue;
  articles.push(fr);
  for (const lang of LOCALES.filter((l) => l !== "fr")) {
    const a = loadOne(slug, lang, fr);
    if (a) articles.push(a);
  }
}

const banner = `// AUTO-GENERATED by scripts/generate-blog-data.mjs — do not edit by hand.
// Regenerate with: bun run blog:gen
`;

const types = `
export interface BlogFaqItem { q: string; a: string }
export interface BlogArticle {
  slug: string;
  lang: "fr" | "en" | "ar";
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  cluster: string;
  funnel: string;
  keywords: string[];
  heroImage: string;
  heroAlt: string;
  ogImage: string;
  faq: BlogFaqItem[];
  bodyHtml: string;
  readingMinutes: number;
  sourceHash: string | null;
}
`;

const body = `export const BLOG_ARTICLES: BlogArticle[] = ${JSON.stringify(articles, null, 2)};\n`;

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, banner + types + "\n" + body);

console.log(`Generated ${articles.length} blog article entries → ${OUT_FILE.replace(ROOT + "/", "")}`);
