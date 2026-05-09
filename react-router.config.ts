import type { Config } from "@react-router/dev/config";
import { allApartments } from "./src/data/appData";
import { BLOG_ARTICLES } from "./src/lib/blog-data.generated";

const LOCALES = ["fr", "en", "ar"] as const;
const STATIC_PATHS = ["", "/apartments", "/gallery", "/contact", "/reglement", "/blog"];
const LEGAL_SLUGS = ["mentions-legales", "confidentialite", "conditions"] as const;
const LEGAL_PATHS = LEGAL_SLUGS.map((s) => `/legal/${s}`);
const APT_PATHS = allApartments.map((a) => `/apartments/${a.slug}`);

export default {
  appDirectory: "src",
  ssr: false,
  async prerender() {
    const baseLocalized = LOCALES.flatMap((lang) =>
      [...STATIC_PATHS, ...APT_PATHS, ...LEGAL_PATHS].map((p) => `/${lang}${p}`),
    );
    const blogArticles = BLOG_ARTICLES.map(
      (a) => `/${a.lang}/blog/${a.slug}`,
    );
    return ["/", ...baseLocalized, ...blogArticles];
  },
} satisfies Config;
