import { Link } from "react-router";
import {
  Car,
  ChevronDown,
  MessageCircle,
  Parking,
  Phone,
  Snowflake,
  Star,
  Wifi,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedHref } from "@/lib/i18n";
import { contactInfo, googleReviews } from "@/data/appData";

const TRUST_EMOJIS = ["⚡", "💶", "🛡️"] as const;

export default function HeroSection() {
  const { t } = useLanguage();
  const loc = useLocalizedHref();
  const phoneDigits = contactInfo.phone.primary.replace(/[^+\d]/g, "");
  const reviewsBasedOn = t.hero.reviews.basedOn.replace(
    "{count}",
    googleReviews.count.toString(),
  );

  const featureRows = [
    { Icon: Phone, label: t.hero.features.ownerAvailable },
    { Icon: Car, label: t.hero.features.beachByCar },
    { Icon: Wifi, label: t.hero.features.wifiFibre },
    { Icon: Snowflake, label: t.hero.features.airConditioning },
    { Icon: Parking, label: t.hero.features.freeParking },
  ];

  const trustItems = [
    t.hero.trustItems.fastBooking,
    t.hero.trustItems.payOnArrival,
    t.hero.trustItems.noDeposit,
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/COMMON/00-background.avif"
          alt={t.hero.imageAlt}
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/70" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-24 lg:py-12 animate-fade-in">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 lg:gap-8 items-center">
          {/* LEFT — Google Reviews */}
          <aside className="order-2 lg:order-1 mx-auto lg:mx-0 w-full max-w-xs lg:max-w-none">
            <div className="bg-black/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white shadow-lg">
              <div className="text-center">
                <div className="text-5xl font-bold leading-none mb-2">
                  {googleReviews.rating.toFixed(1)}
                </div>
                <div
                  className="flex justify-center gap-1 mb-2"
                  aria-label={`${googleReviews.rating} / 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      style={{ fill: "#fbbf24", color: "#fbbf24" }}
                    />
                  ))}
                </div>
                <div className="text-sm text-white/80">{reviewsBasedOn}</div>
              </div>
              <hr className="border-white/15 my-4" />
              <a
                href={googleReviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors"
              >
                <GoogleGIcon className="w-4 h-4" />
                {t.hero.reviews.viewOnGoogle}
              </a>
            </div>
          </aside>

          {/* CENTER — Title + description + trust pills + CTAs */}
          <div className="order-1 lg:order-2 text-center max-w-2xl mx-auto">
            <span className="inline-block text-white/90 text-lg mb-4 tracking-wide border-b border-white/30 pb-2">
              {t.hero.subtitle}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 shadow-xs">
              {t.hero.title}
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto shadow-xs leading-relaxed">
              {t.hero.description}
            </p>

            {/* Trust pills — same family as hero buttons but lighter */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {trustItems.map((label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs md:text-sm text-white/85 transition-colors"
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {TRUST_EMOJIS[i]}
                  </span>
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                variant="hero"
                className="min-w-[200px] rounded-full hover:scale-105 transition-transform"
              >
                <Link viewTransition to={loc("/gallery")}>
                  {t.hero.exploreGallery}
                </Link>
              </Button>
              <Button
                asChild
                variant="heroSolid"
                size="lg"
                className="min-w-[200px] rounded-full hover:scale-105 transition-transform"
              >
                <Link viewTransition to={loc("/apartments")}>
                  {t.hero.exploreApartments}
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT — Features (Lucide icons matching apartment page) + WhatsApp/Phone side by side */}
          <aside className="order-3 lg:order-3 mx-auto lg:mx-0 w-full max-w-xs lg:max-w-none">
            <div className="bg-black/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white shadow-lg space-y-4">
              <ul className="space-y-3 text-sm">
                {featureRows.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 text-white/90" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
              <hr className="border-white/15" />
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={contactInfo.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full px-3 py-2 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.hero.features.whatsappDirect}
                </a>
                <a
                  href={`tel:${phoneDigits}`}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full px-3 py-2 text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {t.hero.features.callDirect}
                </a>
              </div>
            </div>
          </aside>
          </div>

          {/* Mobile scroll indicator — flows after content to avoid overlap */}
          <a
            href="#welcome"
            className="lg:hidden mt-12 flex flex-col items-center justify-center text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="text-sm mb-2 text-center">{t.hero.scrollDown}</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 w-full hidden lg:flex justify-center text-white animate-bounce pointer-events-none">
        <a
          href="#welcome"
          className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
        >
          <span className="text-sm mb-2 text-center">{t.hero.scrollDown}</span>
          <ChevronDown className="h-6 w-6" />
        </a>
      </div>
    </section>
  );
}

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
