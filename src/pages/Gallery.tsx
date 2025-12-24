import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { galleryImages, allApartments } from "@/data/appData";

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filteredImages, setFilteredImages] = useState(galleryImages);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeApartmentFilter, setActiveApartmentFilter] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Filter gallery images by category
  const filterGallery = (category: string) => {
    setActiveFilter(category);
    setActiveApartmentFilter(null); // Reset apartment filter when changing main category

    if (category === "all") {
      setFilteredImages(galleryImages);
    } else {
      setFilteredImages(galleryImages.filter(img => img.category === category));
    }
  };

  // Filter gallery images by apartment
  const filterByApartment = (apartmentId: string) => {
    setActiveApartmentFilter(apartmentId);

    if (apartmentId === "all") {
      setFilteredImages(galleryImages.filter(img => img.category === "apartments"));
    } else {
      setFilteredImages(galleryImages.filter(img => img.category === "apartments" && img.apartment === apartmentId));
    }
  };

  // Handle lightbox navigation
  const navigateGallery = (direction: "prev" | "next") => {
    if (selectedImage === null) return;

    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage);
    let newIndex: number;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(filteredImages[newIndex].id);
  };

  // Touch gesture handlers for lightbox
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateGallery("next");
    }
    if (isRightSwipe) {
      navigateGallery("prev");
    }
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;

      if (e.key === "Escape") {
        setSelectedImage(null);
      } else if (e.key === "ArrowLeft") {
        navigateGallery("prev");
      } else if (e.key === "ArrowRight") {
        navigateGallery("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, filteredImages]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-10 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.gallery.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {t.gallery.subtitle}
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>

        {/* Gallery Filters */}
        <section className="py-10">
          <div className="container">
            <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
              {["all", "exterior", "apartments", "proximity"].map((category) => (
                <button
                  key={category}
                  onClick={() => filterGallery(category)}
                  className={cn(
                    "px-6 py-2 rounded-full transition-all border",
                    activeFilter === category
                      ? "bg-primary text-primary-foreground shadow-lg border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                  )}
                >
                  {category === "all"
                    ? t.gallery.filters.all
                    : category === "exterior"
                      ? t.gallery.filters.exterior
                      : category === "apartments"
                        ? t.gallery.filters.apartments
                        : t.gallery.filters.proximity}
                </button>
              ))}
            </div>

            {/* Apartment Subfilters - Only show when apartments category is active */}
            {activeFilter === "apartments" && (
              <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
                <button
                  onClick={() => filterByApartment("all")}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all text-sm border",
                    activeApartmentFilter === null || activeApartmentFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-lg border-primary"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                  )}
                >
                  {t.gallery.filters.allApartments || "All Apartments"}
                </button>
                {allApartments.map((apartment) => (
                  <button
                    key={apartment.id}
                    onClick={() => filterByApartment(apartment.id)}
                    className={cn(
                      "px-4 py-2 rounded-full transition-all text-sm border",
                      activeApartmentFilter === apartment.id
                        ? "bg-primary text-primary-foreground shadow-lg border-primary"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {apartment.type} (N°{apartment.id})
                  </button>
                ))}
              </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedImage(image.id)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white">{image.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div
            ref={lightboxRef}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-4 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => navigateGallery("prev")}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="max-w-5xl max-h-[80vh] overflow-hidden">
              {filteredImages.find(img => img.id === selectedImage) && (
                <img
                  src={filteredImages.find(img => img.id === selectedImage)?.src}
                  alt={filteredImages.find(img => img.id === selectedImage)?.alt}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}
            </div>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-4 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => navigateGallery("next")}
            >
              <span className="sr-only">Next</span>
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
