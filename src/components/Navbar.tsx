import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.apartments, path: "/apartments" },
    { name: t.nav.gallery, path: "/gallery" },
    { name: t.nav.contact, path: "/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-white/80 dark:bg-card/80 backdrop-blur-lg py-3 shadow-md" : "bg-transparent py-5")}
    dir={language === "ar" ? "rtl" : "ltr"}>
      <nav className={cn("container flex justify-between items-center", language === "ar" ? "flex-row-reverse" : "") }>
        <div className={cn("flex items-center", language === "ar" ? "flex-row-reverse space-x-reverse space-x-4" : "space-x-4") }>
          <Link to="/" className={cn("flex items-center", language === "ar" ? "flex-row-reverse space-x-reverse space-x-2" : "space-x-2") }>
            <img
              src="/assets/logo.avif"
              alt="Résidence Oasis"
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <LanguageSelector />
        </div>

        {/* Desktop Navigation */}
        <ul className={cn("hidden md:flex", language === "ar" ? "flex-row-reverse space-x-reverse space-x-8" : "space-x-8") }>
          {navLinks.map(link => <li key={link.name} className="relative">
              <Link to={link.path} className="font-medium transition-colors hover:text-oasis-teal dark:hover:text-oasis-teal-light after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-oasis-teal after:transition-all hover:after:w-full">
                {link.name}
              </Link>
            </li>)}
        </ul>

        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn("absolute top-full left-0 right-0 z-40 bg-card shadow-lg border-t border-border md:hidden transition-all duration-300", mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}
        dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="container py-4">
          <ul className="space-y-4">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="block text-lg font-medium transition-colors hover:text-oasis-teal dark:hover:text-oasis-teal-light py-2" 
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
