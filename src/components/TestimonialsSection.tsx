import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { testimonials, Testimonial } from "@/data/appData";

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextTestimonial = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
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
      nextTestimonial();
    }
    if (isRightSwipe) {
      prevTestimonial();
    }
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section bg-muted py-10">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-muted-foreground">
            {t.testimonials.description}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div
            ref={containerRef}
            className="relative min-h-[400px] md:min-h-[250px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={cn(
                  "absolute inset-0 glass-card p-4 md:p-8 lg:p-10 transition-all duration-500",
                  activeIndex === index
                    ? "opacity-100 translate-x-0 z-10"
                    : index < activeIndex
                      ? "opacity-0 -translate-x-full z-0"
                      : "opacity-0 translate-x-full z-0"
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
                    <p className="text-sm md:text-lg font-semibold text-center md:text-left">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">{testimonial.location}</p>
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
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-card hover:bg-muted border border-border transition-colors"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Previous testimonial</span>
            </button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (isAnimating) return;
                    setIsAnimating(true);
                    setActiveIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2 md:h-3 rounded-full transition-all ${
                      activeIndex === index
                        ? "bg-primary w-4 md:w-6"
                        : "w-2 md:w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-card hover:bg-muted border border-border transition-colors"
              disabled={isAnimating}
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Next testimonial</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
