import {
  BLOG_ARTICLES,
  type BlogArticle,
  type BlogFaqItem,
} from "@/lib/blog-data.generated";
import { LOCALES, type Lang } from "@/lib/i18n";

export type { BlogArticle, BlogFaqItem } from "@/lib/blog-data.generated";

export interface BlogArticleContent {
  bodyHtml: string;
  faq: BlogFaqItem[];
}

/**
 * Article bodies, one module per article and per language. Vite turns each into
 * its own chunk, so a reader downloads the ~12 KB of the piece they opened
 * instead of the 2.9 MB of every article in every language.
 */
const CONTENT = import.meta.glob<BlogArticleContent>("./blog-content/*.ts");

export async function loadArticleContent(
  slug: string,
  lang: Lang,
): Promise<BlogArticleContent | null> {
  const load = CONTENT[`./blog-content/${slug}.${lang}.ts`];
  if (!load) return null;
  const { bodyHtml, faq } = await load();
  return { bodyHtml, faq };
}

export function getAllSlugs(): string[] {
  return [...new Set(BLOG_ARTICLES.map((a) => a.slug))];
}

export function getArticle(slug: string, lang: Lang): BlogArticle | null {
  return BLOG_ARTICLES.find((a) => a.slug === slug && a.lang === lang) ?? null;
}

export function getAllArticles(lang: Lang): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.lang === lang).sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );
}

export function getAvailableLocales(slug: string): Lang[] {
  const locales = BLOG_ARTICLES.filter((a) => a.slug === slug).map((a) => a.lang);
  return (LOCALES as readonly string[])
    .filter((l) => locales.includes(l as Lang))
    .map((l) => l as Lang);
}
