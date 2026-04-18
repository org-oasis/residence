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
  return `${SITE_URL}/${lang}${clean}`;
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
