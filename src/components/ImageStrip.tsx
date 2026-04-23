import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "@/components/icons";
import { cn } from "@/lib/utils";
import FullscreenImageViewer from "./FullscreenImageViewer";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ImageStripProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageStrip({ images, alt, className }: ImageStripProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!images || images.length === 0) return null;

  // DOM-stable rendering: always render up to 2 slots so the grid layout is
  // known at prerender time. CSS (grid-cols-1 md:grid-cols-2 + hidden md:block
  // on the 2nd slot) decides what is visible — avoids the "huge image shrinks
  // on hydration" flash when useMediaQuery flips from false to true.
  const slotCount = Math.min(2, images.length);
  const effectiveVisible = isDesktop ? slotCount : 1;
  const maxStart = Math.max(0, images.length - effectiveVisible);
  const safeStart = Math.min(startIndex, maxStart);

  const slots = Array.from({ length: slotCount }, (_, i) => ({
    image: images[safeStart + i],
    index: safeStart + i,
  })).filter((x) => Boolean(x.image));

  const goToPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  const rangeEnd = Math.min(safeStart + slotCount, images.length);

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {slots.map(({ image, index }, i) => (
            <button
              key={`${index}-${image}`}
              type="button"
              onClick={() => setFullscreenIndex(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-xl cursor-zoom-in group bg-muted",
                i === 1 && "hidden md:block",
              )}
              aria-label={`${alt} - Image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${alt} - ${index + 1}`}
                loading={index < 2 ? "eager" : "lazy"}
                width="800"
                height="600"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              disabled={safeStart === 0}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={safeStart >= maxStart}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 pointer-events-none">
              {safeStart + 1}
              {slotCount === 2 && rangeEnd > safeStart + 1 && (
                <span className="hidden md:inline">–{rangeEnd}</span>
              )}{" "}
              / {images.length}
            </div>
          </>
        )}
      </div>

      {fullscreenIndex !== null && (
        <FullscreenImageViewer
          images={images}
          alt={alt}
          currentIndex={fullscreenIndex}
          isOpen={fullscreenIndex !== null}
          onClose={() => setFullscreenIndex(null)}
        />
      )}
    </>
  );
}
