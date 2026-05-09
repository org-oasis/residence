import type { MetaFunction } from "react-router";
import { useParams, Navigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { dictFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { buildBreadcrumbList } from "@/lib/jsonld";

export const LEGAL_SLUGS = [
  "mentions-legales",
  "confidentialite",
  "conditions",
] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const SLUG_TO_KEY: Record<LegalSlug, "mentionsLegales" | "confidentialite" | "conditions"> = {
  "mentions-legales": "mentionsLegales",
  confidentialite: "confidentialite",
  conditions: "conditions",
};

function isLegalSlug(s: unknown): s is LegalSlug {
  return typeof s === "string" && (LEGAL_SLUGS as readonly string[]).includes(s);
}

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const slug = isLegalSlug(params.slug) ? params.slug : "mentions-legales";
  const key = SLUG_TO_KEY[slug];
  const t = dictFor(lang);
  const seo = t.seo.legal[key];
  return buildMeta({
    lang,
    pathname: `/legal/${slug}`,
    title: seo.title,
    description: seo.description,
    image: "/og/og-home.png",
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.legal.label, url: `/${lang}/legal/${slug}` },
        { name: t.legal[key].title, url: `/${lang}/legal/${slug}` },
      ]),
    ],
  });
};

export default function Legal() {
  const { t } = useLanguage();
  const { slug } = useParams<{ slug?: string }>();

  if (!isLegalSlug(slug)) {
    return <Navigate to="../mentions-legales" replace />;
  }
  const key = SLUG_TO_KEY[slug];
  const block = t.legal[key];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="relative py-10 bg-gradient-to-r from-sea-light to-white overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {block.title}
              </h1>
              <p className="text-muted-foreground text-lg">{block.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="section py-12">
          <div className="container max-w-3xl">
            <article className="prose prose-slate max-w-none">
              {block.sections.map((s, i) => (
                <section key={i} className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">{s.heading}</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {s.body}
                  </p>
                </section>
              ))}
              <p className="text-xs text-muted-foreground mt-12">
                {t.legal.lastUpdated}: {block.lastUpdated}
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
