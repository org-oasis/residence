import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { allApartments } from "@/data/appData";
import { useGalleryFilters } from "@/hooks/useGalleryFilters";
import type { MetaFunction } from "react-router";
import { dictFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { buildBreadcrumbList } from "@/lib/jsonld";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  return buildMeta({
    lang,
    pathname: "/gallery",
    title: t.seo.gallery.title,
    description: t.seo.gallery.description,
    image: "/og/og-home.png",
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.nav.gallery, url: `/${lang}/gallery` },
      ]),
    ],
  });
};

const CATEGORIES = ["all", "exterior", "apartments", "proximity"] as const;

export default function Gallery() {
  const { t } = useLanguage();
  const { activeCategory, activeApartment, filteredImages, setCategory, setApartment } =
    useGalleryFilters();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categoryLabel = (key: string): string => {
    if (key === "all") return t.gallery.filters.all;
    if (key === "exterior") return t.gallery.filters.exterior;
    if (key === "apartments") return t.gallery.filters.apartments;
    return t.gallery.filters.proximity;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="relative py-10 bg-linear-to-r from-sea-light to-white overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.gallery.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">{t.gallery.subtitle}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>

        {/* Filters */}
        <section className="py-10">
          <div className="container">
            <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategory(category)}
                  className={cn(
                    "px-6 py-2 rounded-full transition-all border",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-lg border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border",
                  )}
                >
                  {categoryLabel(category)}
                </button>
              ))}
            </div>

            {activeCategory === "apartments" && (
              <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setApartment("all")}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all text-sm border",
                    activeApartment === null || activeApartment === "all"
                      ? "bg-primary text-primary-foreground shadow-lg border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border",
                  )}
                >
                  {t.gallery.filters.allApartments || "All Apartments"}
                </button>
                {allApartments.map((apartment) => (
                  <button
                    key={apartment.id}
                    type="button"
                    onClick={() => setApartment(apartment.id)}
                    className={cn(
                      "px-4 py-2 rounded-full transition-all text-sm border",
                      activeApartment === apartment.id
                        ? "bg-primary text-primary-foreground shadow-lg border-primary"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {apartment.type} (N°{apartment.id})
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className="relative overflow-hidden rounded-xl aspect-4/3 cursor-zoom-in group text-left"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={image.alt}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white">{image.alt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox — shared component handles keyboard, touch, navigation. */}
        {lightboxIndex !== null && (
          <FullscreenImageViewer
            images={filteredImages.map((img) => img.src)}
            alt={filteredImages[lightboxIndex]?.alt ?? ""}
            currentIndex={lightboxIndex}
            isOpen
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
