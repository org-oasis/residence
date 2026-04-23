import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { Menu, X } from "@/components/icons";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedHref } from "@/lib/i18n";

/** Scroll subscription wired into useSyncExternalStore. Module-scope so identity is stable across renders. */
function subscribeScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
function getScrollSnapshot(): boolean {
  return window.scrollY > 20;
}
function getServerSnapshot(): boolean {
  return false;
}

const menuAriaLabels = {
  fr: { open: "Ouvrir le menu", close: "Fermer le menu" },
  en: { open: "Open menu", close: "Close menu" },
  ar: { open: "فتح القائمة", close: "إغلاق القائمة" },
} as const;

export default function Navbar() {
  const { t, language } = useLanguage();
  const loc = useLocalizedHref();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // React's official pattern for subscribing to a browser API (window scroll position).
  // Handles SSR, hydration, and scroll restoration timing without any setTimeout/RAF hack.
  // https://react.dev/reference/react/useSyncExternalStore#subscribing-to-a-browser-api
  const scrolled = useSyncExternalStore(subscribeScroll, getScrollSnapshot, getServerSnapshot);

  const navLinks = [
    { name: t.nav.home, path: loc("/") },
    { name: t.nav.apartments, path: loc("/apartments") },
    { name: t.nav.reglement, path: loc("/reglement") },
    { name: t.nav.contact, path: loc("/contact") },
  ];

  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-white/80 backdrop-blur-lg py-3 shadow-md" : "bg-transparent py-5")}
    dir={language === "ar" ? "rtl" : "ltr"}>
      <nav className={cn("container flex items-center gap-4", language === "ar" ? "flex-row-reverse" : "")}>
        {/* Zone gauche : logo (équilibre la zone droite via flex-1) */}
        <div className={cn("flex items-center flex-1", language === "ar" ? "flex-row-reverse" : "")}>
          <Link viewTransition to={loc("/")} className="flex items-center">
            <img
              src="/assets/logo.avif"
              alt="Résidence Oasis"
              className="h-10 w-10 rounded-full"
            />
          </Link>
        </div>

        {/* Zone centrale : navigation desktop centrée */}
        <ul className={cn("hidden md:flex items-center justify-center", language === "ar" ? "flex-row-reverse space-x-reverse space-x-8" : "space-x-8")}>
          {navLinks.map(link => <li key={link.name} className="relative">
              <Link viewTransition to={link.path} className="font-medium transition-colors hover:text-oasis-teal after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-oasis-teal after:transition-all hover:after:w-full">
                {link.name}
              </Link>
            </li>)}
        </ul>

        {/* Zone droite : sélecteur de langue + burger mobile (flex-1 pour équilibrer la zone gauche) */}
        <div className={cn("flex items-center justify-end flex-1 gap-2", language === "ar" ? "flex-row-reverse" : "")}>
          <LanguageSelector />
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full"
              aria-label={mobileMenuOpen ? menuAriaLabels[language].close : menuAriaLabels[language].open}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn("absolute top-full left-0 right-0 z-40 bg-card shadow-lg border-t border-border md:hidden transition-all duration-300", mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}
        dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="container py-4">
          <ul className="space-y-4">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link viewTransition
                  to={link.path}
                  className="block text-lg font-medium transition-colors hover:text-oasis-teal py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>;
}
