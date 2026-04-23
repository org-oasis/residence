import { Link, Navigate, useParams } from "react-router";
import {
  Users,
  Expand,
  Building,
  Whatsapp,
  Telegram,
  Phone,
  ArrowLeft,
  Info,
  Price,
  Airbnb,
} from "@/components/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { MetaFunction } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ImageStrip from "@/components/ImageStrip";
import CalendarAvailability from "@/components/CalendarAvailability";
import { getFeatureIcon } from "@/lib/iconUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getApartmentBySlug } from "@/data/appData";
import {
  dictFor,
  isLang,
  DEFAULT_LANG,
  useLocalizedHref,
  type Lang,
} from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { buildApartmentSchema, buildBreadcrumbList } from "@/lib/jsonld";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  const slug = (params.slug ?? "") as string;
  const apt = getApartmentBySlug(slug);
  if (!apt) return [];
  const name =
    t.apartmentNames[apt.name as keyof typeof t.apartmentNames] || apt.name;
  const desc =
    t.apartmentDescriptionsShort[
      apt.description as keyof typeof t.apartmentDescriptionsShort
    ] || apt.description;
  const pathname = `/apartments/${apt.slug}`;
  return buildMeta({
    lang,
    pathname,
    title: `${name} (${apt.type}, ${apt.size}m²) ${t.seo.apartmentDetailSuffix}`,
    description: desc,
    image: apt.image,
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.nav.apartments, url: `/${lang}/apartments` },
        { name, url: `/${lang}${pathname}` },
      ]),
      buildApartmentSchema({
        apartment: apt,
        pathname: `/${lang}${pathname}`,
        name,
        description: desc,
      }),
    ],
  });
};

export default function ApartmentDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const loc = useLocalizedHref();
  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    return <Navigate to={loc("/apartments")} replace />;
  }

  const translatedName =
    t.apartmentNames[apartment.name as keyof typeof t.apartmentNames] ||
    apartment.name;
  const translatedDescription =
    t.apartmentDescriptionsShort[
      apartment.description as keyof typeof t.apartmentDescriptionsShort
    ] || apartment.description;
  const apartmentLabel =
    t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] ||
    `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`;

  const steps = [
    { n: 1, title: t.apartments.bookingSteps.step1Title, desc: t.apartments.bookingSteps.step1Desc },
    { n: 2, title: t.apartments.bookingSteps.step2Title, desc: t.apartments.bookingSteps.step2Desc },
    { n: 3, title: t.apartments.bookingSteps.step3Title, desc: t.apartments.bookingSteps.step3Desc },
    { n: 4, title: t.apartments.bookingSteps.step4Title, desc: t.apartments.bookingSteps.step4Desc },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <Link viewTransition
            to={loc("/apartments")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-6 w-6 mr-1" />
            {t.nav.apartments}
          </Link>

          <header className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">{translatedName}</h1>
            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5 shrink-0">
              {apartmentLabel}
            </Badge>
          </header>

          <ImageStrip images={apartment.images} alt={translatedName} />

          {/* Left: description + 4 InfoTiles stacked · Right: features */}
          <section className="grid lg:grid-cols-2 gap-10 mt-10">
            <div className="flex flex-col justify-between gap-6 h-full">
              <div>
                <h2 className="text-2xl font-bold mb-4">{t.labels.description}</h2>
                <p className="text-muted-foreground leading-relaxed">{translatedDescription}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {t.apartments.capacityPolicy.note}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <InfoTile
                  icon={<Users className="h-6 w-6 text-primary" />}
                  label={t.apartments.filters.guests}
                  value={String(apartment.capacity)}
                  hint={t.apartments.capacityPolicy.tooltip}
                  hintLabel={t.apartments.capacityPolicy.ariaLabel}
                />
                <InfoTile
                  icon={<Expand className="h-6 w-6 text-primary" />}
                  label={t.apartments.filters.size}
                  value={`${apartment.size} m²`}
                />
                <InfoTile
                  icon={<Building className="h-6 w-6 text-primary" />}
                  label={t.apartments.filters.floor}
                  value={
                    t.floors[String(apartment.floor) as keyof typeof t.floors] ||
                    String(apartment.floor)
                  }
                />
                <InfoTile
                  icon={<Price className="h-6 w-6 text-primary" />}
                  label={t.apartments.pricingPerNight}
                  value={`€${apartment.priceeur} · ${apartment.pricedz} DZD`}
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {t.apartments.featuresAndAmenities}
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {apartment.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                  >
                    <span className="text-primary shrink-0">{getFeatureIcon(feature, "h-6 w-6")}</span>
                    <span className="text-sm">
                      {t.features[feature as keyof typeof t.features] || feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Separator className="my-12" />

          <section>
            <h2 className="text-2xl font-bold mb-6">{t.apartments.availability}</h2>
            <CalendarAvailability
              apartmentId={apartment.id}
              apartmentName={translatedName}
            />
          </section>

          <Separator className="my-12" />

          {/* Réserver maintenant — sans Airbnb (canal direct privilégié) */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-6">{t.apartments.bookNow}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="bg-[#FF5A5F] hover:bg-[#E31C5F] text-white [&_svg]:size-6"
              >
                <a
                  href={apartment.airbnbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Airbnb className="mr-2" />
                  Airbnb
                </a>
              </Button>
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white [&_svg]:size-6"
              >
                <a
                  href={`https://wa.me/${apartment.contactPhone || "213561472990"}?text=${encodeURIComponent(`${t.contact.messagePrefix} "${translatedName}" [N°${apartment.id}]`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Whatsapp className="mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                className="bg-blue-500 hover:bg-blue-600 text-white [&_svg]:size-6"
              >
                <a
                  href={`https://t.me/residence_oasis?text=${encodeURIComponent(`${t.contact.messagePrefix} "${translatedName}" [N°${apartment.id}]`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Telegram className="mr-2" />
                  Telegram
                </a>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white [&_svg]:size-6">
                <a href={`tel:+${apartment.contactPhone || "213561472990"}`}>
                  <Phone className="mr-2" />
                  {t.contact.phone}
                </a>
              </Button>
            </div>
          </section>

          <Separator className="my-16" />

          <section aria-labelledby="booking-steps-title">
            <h2 id="booking-steps-title" className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t.apartments.bookingSteps.title}
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step) => (
                <li
                  key={step.n}
                  className="flex flex-col items-center text-center p-6 bg-muted/40 rounded-xl border"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                    {step.n}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </section>

          <Separator className="my-16" />

          <section aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t.apartments.faq.title}
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {([1, 2, 3, 4, 5, 6] as const).map((i) => {
                const q = t.apartments.faq[`q${i}` as `q${typeof i}`];
                const a = t.apartments.faq[`a${i}` as `a${typeof i}`];
                return (
                  <details
                    key={i}
                    className="group rounded-lg border bg-card p-4 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium text-base">
                      <span>{q}</span>
                      <span
                        className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
                  </details>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface InfoTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  hintLabel?: string;
}

function InfoTile({ icon, label, value, hint, hintLabel }: InfoTileProps) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="font-semibold">{value}</p>
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={hintLabel ?? label}
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-help"
                >
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs leading-snug">
                {hint}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
