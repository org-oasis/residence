import type { ReactNode } from "react";
import {
  dictFor,
  useLang,
  useSwitchLanguage,
  type Lang,
} from "@/lib/i18n";
import { en } from "@/locales/en";

type Translations = typeof en;

export interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: Translations;
}

// Backwards-compat shim: existing code calls useLanguage() with no Provider.
// All language state is now URL-driven via useLang() / useSwitchLanguage().
export const LanguageProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export function useLanguage(): LanguageContextValue {
  const language = useLang();
  const setLanguage = useSwitchLanguage();
  return { language, setLanguage, t: dictFor(language) as Translations };
}
