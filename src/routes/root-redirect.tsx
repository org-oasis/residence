import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, DEFAULT_LANG, isLang } from "@/lib/i18n";

/**
 * Root URL handler at "/".
 *
 * SEO strategy:
 * - `noindex, follow`: Google should not index `/` itself; it should follow the
 *   `<link rel="alternate" hreflang>` tags to discover and index `/fr/`, `/en/`,
 *   `/ar/` directly. This eliminates the redirect-chain Search Console flagged.
 * - Canonical points to the default-language home (with trailing slash so it
 *   matches the prerendered file at `/fr/index.html` and avoids the GH Pages
 *   trailing-slash 301 redirect).
 * - No `<meta http-equiv="refresh">` (Google's docs flag this as anti-pattern
 *   for redirects: use server-side 3xx OR client-side JS — never meta refresh).
 *
 * Runtime UX (humans only): a single `location.replace` jumps to the user's
 * preferred language. No history entry, no SPA navigation roundtrip — one hop.
 */
export const meta: MetaFunction = () => [
  { title: "Résidence Oasis" },
  {
    name: "description",
    content: "Résidence Oasis - Appartements modernes en bord de mer à Skikda",
  },
  { name: "robots", content: "noindex, follow" },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/${DEFAULT_LANG}/` },
  ...LOCALES.map((l) => ({
    tagName: "link" as const,
    rel: "alternate",
    hrefLang: l,
    href: `${SITE_URL}/${l}/`,
  })),
  {
    tagName: "link",
    rel: "alternate",
    hrefLang: "x-default",
    href: `${SITE_URL}/${DEFAULT_LANG}/`,
  },
];

export default function RootRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let target: string = DEFAULT_LANG;
    try {
      const stored = window.localStorage.getItem("language");
      if (stored && isLang(stored)) target = stored;
    } catch {
      // localStorage unavailable (private mode, sandboxed iframe) → default lang.
    }
    window.location.replace(`/${target}/`);
  }, []);

  // Fallback for no-JS clients (assistive tech, lynx, etc.): a semantic link
  // to the default-language home. Hidden visually since JS will redirect first.
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <a href={`/${DEFAULT_LANG}/`} className="text-lg underline hover:text-primary">
        Résidence Oasis →
      </a>
    </main>
  );
}
