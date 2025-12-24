import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/COMMON/00-background.avif"
          alt="Residence Oasis Background"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          loading="eager"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4 animate-fade-in">
        <div className="max-w-4xl">
          <span className="inline-block text-white/90 text-lg mb-4 tracking-wide border-b border-white/30 pb-2">
            {t.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 shadow-sm">
            {t.hero.title}
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto shadow-sm">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="heroSolid" className="min-w-[200px] rounded-full hover:scale-105 transition-transform">
              <Link to="/gallery">{t.hero.exploreGallery}</Link>
            </Button>
            <Button asChild variant="hero" size="lg" className="min-w-[200px] rounded-full hover:scale-105 transition-transform">
              <Link to="/apartments">{t.hero.exploreApartments}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Simple CSS-only animation for the arrow (No JS required) */}
      <div className="absolute bottom-10 w-full flex justify-center text-white animate-bounce">
        <a
          href="#welcome"
          className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
          aria-label={t.hero.scrollDown}
        >
          <span className="text-sm mb-2 text-center">{t.hero.scrollDown}</span>
          <ChevronDown className="h-6 w-6" />
        </a>
      </div>
    </section>
  );
}
