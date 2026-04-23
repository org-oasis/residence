import { Link } from "react-router";
import type { MetaFunction } from "react-router";
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
import { buildBreadcrumbList, buildBlogSchema } from "@/lib/jsonld";
import { getAllArticles } from "@/lib/blog";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  const articles = getAllArticles(lang);
  const blogUrl = `${SITE_URL}/${lang}/blog`;
  return buildMeta({
    lang,
    pathname: "/blog",
    title: t.seo.blog.title,
    description: t.seo.blog.description,
    image: "/og/og-home.png",
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.nav.blog, url: `/${lang}/blog` },
      ]),
      buildBlogSchema(
        blogUrl,
        articles.map((a) => ({
          url: `${SITE_URL}/${lang}/blog/${a.slug}`,
          headline: a.title,
          description: a.description,
          image: a.heroImage || "/og/og-home.png",
          datePublished: a.datePublished,
        })),
        lang,
      ),
    ],
  });
};

export default function BlogIndex() {
  const { t, language } = useLanguage();
  const loc = useLocalizedHref();
  const articles = getAllArticles(language);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="relative py-10 bg-gradient-to-r from-sea-light to-white overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.blog.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                {t.blog.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="section py-10">
          <div className="container">
            {articles.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">
                {t.blog.empty}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((a) => (
                  <Link
                    key={a.slug}
                    to={loc(`/blog/${a.slug}`)}
                    className="group rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-shadow"
                  >
                    {a.heroImage && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={a.heroImage}
                          alt={a.heroAlt || a.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <div className="text-xs text-primary font-medium uppercase tracking-wider">
                        {a.cluster}
                      </div>
                      <h2 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {a.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {a.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <time dateTime={a.datePublished}>{a.datePublished}</time>
                        <span>{a.readingMinutes} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
