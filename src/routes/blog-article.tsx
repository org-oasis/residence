import { Link, Navigate, useParams } from "react-router-dom";
import type { MetaFunction } from "react-router";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  dictFor,
  isLang,
  DEFAULT_LANG,
  useLocalizedHref,
  type Lang,
} from "@/lib/i18n";
import { buildMeta, SITE_URL } from "@/lib/seo";
import {
  buildArticleSchema,
  buildBreadcrumbList,
  buildFaqPage,
} from "@/lib/jsonld";
import { getArticle } from "@/lib/blog";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const slug = (params.slug ?? "") as string;
  const article = getArticle(slug, lang);
  if (!article) return [];
  const t = dictFor(lang);
  const url = `${SITE_URL}/${lang}/blog/${article.slug}`;
  const jsonLd = [
    buildBreadcrumbList([
      { name: t.nav.home, url: `/${lang}` },
      { name: t.nav.blog, url: `/${lang}/blog` },
      { name: article.title, url: `/${lang}/blog/${article.slug}` },
    ]),
    buildArticleSchema({
      url,
      headline: article.title,
      description: article.description,
      image: article.heroImage || "/og/og-home.png",
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      inLanguage: { fr: "fr-FR", en: "en-US", ar: "ar-DZ" }[lang],
      keywords: article.keywords,
    }),
  ];
  if (article.faq.length > 0) {
    jsonLd.push(
      buildFaqPage(article.faq.map((f) => ({ question: f.q, answer: f.a }))),
    );
  }
  return buildMeta({
    lang,
    pathname: `/blog/${article.slug}`,
    title: `${article.title} ${t.seo.blogArticleSuffix}`,
    description: article.description,
    image: article.ogImage || article.heroImage || "/og/og-home.png",
    jsonLd,
  });
};

export default function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const loc = useLocalizedHref();
  const article = getArticle(slug, language);

  if (!article) {
    return <Navigate to={loc("/blog")} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <article className="container max-w-3xl">
          <Link
            to={loc("/blog")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.nav.blog}
          </Link>

          <header className="mb-8">
            <div className="text-xs text-primary font-medium uppercase tracking-wider mb-3">
              {article.cluster}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {article.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={article.datePublished}>
                {article.datePublished}
              </time>
              <span>·</span>
              <span>
                {article.readingMinutes} min {t.blog.readingTime}
              </span>
            </div>
          </header>

          {article.heroImage && (
            <img
              src={article.heroImage}
              alt={article.heroAlt || article.title}
              className="w-full aspect-[16/9] object-cover rounded-2xl mb-10"
              loading="eager"
              fetchPriority="high"
            />
          )}

          <div
            className={
              language === "ar" ? "prose-oasis prose-oasis-rtl" : "prose-oasis"
            }
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}
