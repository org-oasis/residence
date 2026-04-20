import type { MetaDescriptor } from "react-router";
import { LOCALES, ogLocaleFor, type Lang } from "@/lib/i18n";

export const SITE_URL = "https://residence-oasis.com";
const DEFAULT_OG = "/og/og-home.png";

export interface SeoInput {
  lang: Lang;
  /** Path WITHOUT locale prefix, e.g. "/apartments". Empty string = home. */
  pathname: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
}

function buildLocalizedUrl(lang: Lang, pathname: string): string {
  const clean = pathname === "" || pathname === "/" ? "" : pathname;
  // Always append trailing slash — matches GitHub Pages' actual URL shape
  // (directory-style URLs) and avoids the 301 roundtrip Google otherwise follows.
  return `${SITE_URL}/${lang}${clean}/`;
}

export function buildMeta({
  lang,
  pathname,
  title,
  description,
  image = DEFAULT_OG,
  noindex = false,
  jsonLd = [],
}: SeoInput): MetaDescriptor[] {
  const canonical = buildLocalizedUrl(lang, pathname);
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical },
    {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    // Explicit dimensions required by WhatsApp's preview bot (without them it skips the preview).
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: title },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:locale", content: ogLocaleFor(lang) },
    { property: "og:site_name", content: "Résidence Oasis" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  for (const altLang of LOCALES) {
    tags.push({
      tagName: "link",
      rel: "alternate",
      hrefLang: altLang,
      href: buildLocalizedUrl(altLang, pathname),
    });
    if (altLang !== lang) {
      tags.push({ property: "og:locale:alternate", content: ogLocaleFor(altLang) });
    }
  }
  tags.push({
    tagName: "link",
    rel: "alternate",
    hrefLang: "x-default",
    href: buildLocalizedUrl("fr", pathname),
  });

  for (const data of jsonLd) {
    tags.push({ "script:ld+json": data } as MetaDescriptor);
  }
  return tags;
}
