import { useLocation, useNavigate, useParams } from "react-router";
import { en } from "@/locales/en";
import { fr } from "@/locales/fr";
import { ar } from "@/locales/ar";

export const LOCALES = ["fr", "en", "ar"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "fr";

const dicts = { fr, en, ar } as const;

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dictFor(lang: Lang | string | undefined) {
  return isLang(lang) ? dicts[lang] : dicts[DEFAULT_LANG];
}

export function ogLocaleFor(lang: Lang): string {
  return { fr: "fr_FR", en: "en_US", ar: "ar_DZ" }[lang];
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function localizedHref(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${lang}`;
  return `/${lang}${clean}`;
}

export function useLang(): Lang {
  const { lang } = useParams<{ lang?: string }>();
  return isLang(lang) ? lang : DEFAULT_LANG;
}

export function useLocalizedHref() {
  const lang = useLang();
  return (path: string) => localizedHref(lang, path);
}

export function useSwitchLanguage() {
  const navigate = useNavigate();
  const location = useLocation();
  return (next: Lang) => {
    const stripped = location.pathname.replace(/^\/(fr|en|ar)(\/|$)/, "/");
    const path = stripped === "/" ? `/${next}` : `/${next}${stripped}`;
    navigate(path + location.search + location.hash);
  };
}
