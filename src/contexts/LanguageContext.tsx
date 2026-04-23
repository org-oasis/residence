import { dictFor, useLang, useSwitchLanguage, type Lang } from "@/lib/i18n";
import { en } from "@/locales/en";

type Translations = typeof en;

export interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: Translations;
}

/**
 * Language hook — URL-driven (no provider needed).
 * Reads language from the current pathname via `useLang()` and exposes the
 * matching dictionary plus a `setLanguage` action that swaps the URL prefix.
 */
export function useLanguage(): LanguageContextValue {
  const language = useLang();
  const setLanguage = useSwitchLanguage();
  return { language, setLanguage, t: dictFor(language) as Translations };
}
