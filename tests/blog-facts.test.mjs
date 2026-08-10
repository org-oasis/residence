import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

import { WEEKLY_DISCOUNT_PCT } from "../src/data/pricing.ts";

const BLOG_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "blog");

/**
 * Every localized markdown file, with the frontmatter `keywords` list removed.
 * Keywords are search queries, not claims: they may legitimately name things the
 * prose must not assert (e.g. an airport travellers wrongly search for).
 */
function loadArticles() {
  return readdirSync(BLOG_DIR)
    .filter((slug) => statSync(join(BLOG_DIR, slug)).isDirectory())
    .flatMap((slug) =>
      readdirSync(join(BLOG_DIR, slug))
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const path = join(BLOG_DIR, slug, file);
          const { data, content } = matter(readFileSync(path, "utf8"));
          const { keywords: _keywords, ...claims } = data;
          return {
            id: `${slug}/${file}`,
            // Frontmatter still carries prose (title, description, FAQ answers),
            // so it is audited too — only the keyword list is exempt.
            text: `${JSON.stringify(claims)}\n${content}`,
          };
        }),
    );
}

const ARTICLES = loadArticles();

/** Fold accents so "aéroport" and "aeroport" are the same needle. */
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

describe("blog corpus", () => {
  test("every article folder ships fr/en/ar and is non-empty", () => {
    expect(ARTICLES.length).toBeGreaterThan(0);
    const byLang = ARTICLES.reduce((acc, a) => {
      const lang = a.id.split("/")[1].replace(".md", "");
      acc[lang] = (acc[lang] ?? 0) + 1;
      return acc;
    }, {});
    expect(byLang.fr).toBe(byLang.en);
    expect(byLang.fr).toBe(byLang.ar);
  });
});

describe("no phantom Skikda airport", () => {
  // Skikda has no commercial airport: travellers fly into Constantine or Annaba.
  // Claiming one in the prose sends guests to a runway that does not serve them.
  const NEEDLES = ["aeroport de skikda", "skikda airport", "مطار سكيكدة"];

  test("no article claims a Skikda airport outside frontmatter keywords", () => {
    const offenders = [];
    for (const article of ARTICLES) {
      const haystack = fold(article.text);
      for (const needle of NEEDLES) {
        if (haystack.includes(fold(needle))) offenders.push(`${article.id}: "${needle}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("long-stay discount stays at the advertised rate", () => {
  // A percentage quoted next to a discount word, in any of the three languages.
  const FORWARD =
    /(?:remises?|reductions?|discounts?|خصم|تخفيض(?:ة|ات)?)[^.!?<>\n]{0,60}?(\d{1,2})\s?%/giu;
  const BACKWARD =
    /(\d{1,2})\s?%[^.!?<>\n]{0,40}?(?:remises?|reductions?|discounts?|خصم|تخفيض(?:ة|ات)?)/giu;

  const quotedDiscounts = (text) => {
    const folded = fold(text);
    const found = [];
    for (const re of [FORWARD, BACKWARD]) {
      re.lastIndex = 0;
      for (const match of folded.matchAll(re)) found.push(Number(match[1]));
    }
    return found;
  };

  test("the regex actually catches a wrong figure (guards the guard)", () => {
    expect(quotedDiscounts("une remise de 10 à 25 %")).toContain(25);
    expect(quotedDiscounts("a 15 % discount")).toContain(15);
  });

  test("no article promises a discount other than the real one", () => {
    const offenders = [];
    for (const article of ARTICLES) {
      for (const pct of quotedDiscounts(article.text)) {
        if (pct !== WEEKLY_DISCOUNT_PCT) offenders.push(`${article.id}: ${pct}%`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
