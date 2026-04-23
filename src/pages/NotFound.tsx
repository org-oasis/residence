
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import type { MetaFunction } from "react-router";
import { Button } from "@/components/ui/button";
import { Home } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { log } from "@/lib/logger";
import { dictFor, isLang, DEFAULT_LANG, useLocalizedHref, type Lang } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  return buildMeta({
    lang,
    pathname: "/404",
    title: t.seo.notFound.title,
    description: t.seo.notFound.description,
    noindex: true,
  });
};

const NotFound = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const loc = useLocalizedHref();

  useEffect(() => {
    log.warn("404: non-existent route", { pathname: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="glass-card p-10 max-w-md text-center animate-fade-in">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">{t.notFound.title}</h2>
        <p className="text-muted-foreground mb-8">
          {t.notFound.description}
        </p>
        <Button asChild className="btn-primary">
          <Link viewTransition to={loc("/")}>
            <Home className="mr-2 h-6 w-6" />
            {t.notFound.returnHome}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
