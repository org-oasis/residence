import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

interface Language {
  code: Lang;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇩🇿" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Hydration guard: avoid mismatched render between SSG and client.
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (langCode: Lang) => {
    setLanguage(langCode);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`text-2xl transition-all duration-200 hover:scale-110 ${
            language === lang.code ? 'opacity-100' : 'opacity-60 hover:opacity-80'
          }`}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
