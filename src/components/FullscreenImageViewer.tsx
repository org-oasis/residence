import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface FullscreenImageViewerProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  alt: string;
}

export default function FullscreenImageViewer({
  images,
  currentIndex: initialIndex,
  isOpen,
  onClose,
  alt
}: FullscreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleClose = () => {
    onClose();
  };

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
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-black/90 animate-fade-in"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <div 
        className="absolute top-4 right-4 z-50 text-white p-3 rounded-full hover:bg-white/20 transition-colors bg-black/30 cursor-pointer"
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white p-4 rounded-full hover:bg-white/20 transition-colors bg-black/30 cursor-pointer"
            onClick={goToPrevious}
            style={{ pointerEvents: 'auto' }}
          >
            <span className="sr-only">Previous</span>
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white p-4 rounded-full hover:bg-white/20 transition-colors bg-black/30 cursor-pointer"
            onClick={goToNext}
            style={{ pointerEvents: 'auto' }}
          >
            <span className="sr-only">Next</span>
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}

      {/* Main image container */}
      <div className="flex items-center justify-center h-full p-4">
        <div className="max-w-5xl max-h-[80vh] overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
} 