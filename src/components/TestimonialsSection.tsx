import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { testimonials } from "@/data/appData";

const ROTATION_MS = 8000;
const MIN_SWIPE_PX = 50;

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  // Auto-rotation: one timer per (activeIndex, isPaused). Idiomatic effect,
  // no setInterval, naturally pauses on hover/focus and resets on user interaction.
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length);
    }, ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused]);

  const next = () => setActiveIndex((i) => (i + 1) % testimonials.length);
  const prev = () =>
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    const start = touchStartRef.current;
    const end = touchEndRef.current;
    if (start === null || end === null) return;
    const distance = start - end;
    if (distance > MIN_SWIPE_PX) next();
    else if (distance < -MIN_SWIPE_PX) prev();
  };

  return (
    <section className="section bg-muted py-10">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.testimonials.title}</h2>
          <p className="text-muted-foreground">{t.testimonials.description}</p>
        </div>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div
            className="relative min-h-[400px] md:min-h-[250px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                aria-hidden={activeIndex !== index}
                className={cn(
                  "absolute inset-0 glass-card p-4 md:p-8 lg:p-10 transition-all duration-500 ease-out",
                  activeIndex === index
                    ? "opacity-100 translate-x-0 z-10"
                    : index < activeIndex
                      ? "opacity-0 -translate-x-full z-0"
                      : "opacity-0 translate-x-full z-0",
                )}
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">
                  <div className="flex flex-col items-center md:items-start shrink-0">
                    <div className="rounded-full overflow-hidden w-14 h-14 md:w-20 md:h-20 mb-3 md:mb-4 border-2 border-primary">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 md:h-4 md:w-4 ${i < testimonial.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm md:text-lg font-semibold text-center md:text-left">
                      {testimonial.name}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                      {testimonial.location}
                    </p>
                  </div>

                  <div className="flex-1 flex items-start md:items-center">
                    <div className="w-full">
                      <blockquote className="italic text-muted-foreground mb-2 md:mb-2 text-sm md:text-base leading-relaxed">
                        "{testimonial.originalContent}"
                      </blockquote>
                      <blockquote className="italic text-primary/90 text-xs md:text-sm border-l-4 border-primary pl-3 md:pl-4 mt-2 md:mt-5 leading-relaxed">
                        {testimonial.translatedContent}
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 md:mt-8">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-full bg-card hover:bg-muted border border-border transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={activeIndex === index}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-2 md:h-3 rounded-full transition-all",
                      activeIndex === index
                        ? "bg-primary w-4 md:w-6"
                        : "w-2 md:w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60",
                    )}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="p-2 rounded-full bg-card hover:bg-muted border border-border transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
