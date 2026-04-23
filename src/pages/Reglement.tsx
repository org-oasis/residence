import type { MetaFunction } from "react-router";
import { Clock, Cigarette, PawPrint, Volume2, Users, FileCheck, Wrench, Shield } from "@/components/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { dictFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { buildBreadcrumbList } from "@/lib/jsonld";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  return buildMeta({
    lang,
    pathname: "/reglement",
    title: t.seo.reglement.title,
    description: t.seo.reglement.description,
    image: "/og/og-reglement.png",
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.nav.reglement, url: `/${lang}/reglement` },
      ]),
    ],
  });
};

export default function Reglement() {
  const { t } = useLanguage();

  const sections = [
    { icon: Clock, key: "checkInOut" as const },
    { icon: Cigarette, key: "smoking" as const },
    { icon: PawPrint, key: "pets" as const },
    { icon: Volume2, key: "noise" as const },
    { icon: Users, key: "events" as const },
    { icon: FileCheck, key: "documents" as const },
    { icon: Wrench, key: "damages" as const },
    { icon: Shield, key: "neighbourhood" as const },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="relative py-10 bg-gradient-to-r from-sea-light to-white overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.reglement.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t.reglement.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="section py-12">
          <div className="container">
            <div className="max-w-3xl mx-auto mb-10 glass-card p-6 border-l-4 border-primary text-center">
              <p className="text-muted-foreground italic">
                {t.reglement.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map(({ icon: Icon, key }) => (
                <article
                  key={key}
                  className="glass-card p-6 animate-fade-in"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold mb-2">
                        {t.reglement.sections[key].title}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {t.reglement.sections[key].body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 glass-card p-6 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground italic">
                {t.reglement.acknowledgement}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
