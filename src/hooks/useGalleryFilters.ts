import { useMemo, useState } from "react";
import { galleryImages } from "@/data/appData";

export type GalleryImage = (typeof galleryImages)[number];

export interface GalleryFilters {
  activeCategory: string;
  activeApartment: string | null;
  filteredImages: GalleryImage[];
  setCategory: (category: string) => void;
  setApartment: (apartmentId: string) => void;
}

/**
 * Encapsulates the gallery's two-level filter (category, then optional apartment id).
 * Pure derived state via `useMemo` — no useEffect, no setState chains.
 */
export function useGalleryFilters(): GalleryFilters {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeApartment, setActiveApartment] = useState<string | null>(null);

  const filteredImages = useMemo<GalleryImage[]>(() => {
    if (activeCategory === "all") return galleryImages;
    if (activeCategory !== "apartments") {
      return galleryImages.filter((img) => img.category === activeCategory);
    }
    if (!activeApartment || activeApartment === "all") {
      return galleryImages.filter((img) => img.category === "apartments");
    }
    return galleryImages.filter(
      (img) => img.category === "apartments" && img.apartment === activeApartment,
    );
  }, [activeCategory, activeApartment]);

  return {
    activeCategory,
    activeApartment,
    filteredImages,
    setCategory: (category) => {
      setActiveCategory(category);
      setActiveApartment(null);
    },
    setApartment: (apartmentId) => setActiveApartment(apartmentId),
  };
}
