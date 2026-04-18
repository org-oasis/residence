import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  FaUsers,
  FaExpand,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTelegram,
  FaPhone,
} from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { MetaFunction } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ImageSlideshow from "@/components/ImageSlideshow";
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl">
          <Link
            to={loc("/apartments")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.nav.apartments}
          </Link>

          <header className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {translatedName}
              </h1>
              <p className="text-muted-foreground">{translatedDescription}</p>
            </div>
            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5 shrink-0">
              {apartmentLabel}
            </Badge>
          </header>

          <ImageSlideshow images={apartment.images} alt={translatedName} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <InfoTile
              icon={<FaUsers className="h-5 w-5 text-primary" />}
              label={t.apartments.filters.guests}
              value={String(apartment.capacity)}
            />
            <InfoTile
              icon={<FaExpand className="h-5 w-5 text-primary" />}
              label={t.apartments.filters.size}
              value={`${apartment.size} m²`}
            />
            <InfoTile
              icon={<FaMapMarkerAlt className="h-5 w-5 text-primary" />}
              label={t.apartments.filters.location}
              value={t.locations[apartment.location] || apartment.location}
            />
            <InfoTile
              icon={<span className="text-primary font-bold">€</span>}
              label={t.apartments.pricingPerNight}
              value={`€${apartment.priceeur} · ${apartment.pricedz} DZD`}
            />
          </div>

          <Separator className="my-10" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {t.apartments.featuresAndAmenities}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {apartment.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <span className="text-primary">{getFeatureIcon(feature)}</span>
                  <span>{t.features[feature as keyof typeof t.features] || feature}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-10" />

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {t.apartments.availability}
            </h2>
            <CalendarAvailability
              apartmentId={apartment.id}
              label={t.apartments.availability}
              availableLabel={t.apartments.available}
              unavailableLabel={t.apartments.unavailable}
              apartmentName={apartmentLabel}
            />
          </section>

          <Separator className="my-10" />

          <section className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              {t.apartments.bookOnAirbnb}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {apartment.airbnbLink && (
                <Button
                  asChild
                  className="bg-[#FF5A5F] hover:bg-[#E31C5F] text-white"
                >
                  <a
                    href={apartment.airbnbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.apartments.bookOnAirbnb}
                  </a>
                </Button>
              )}
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <a
                  href={`https://wa.me/${apartment.contactPhone || "213561472990"}?text=${encodeURIComponent(`${t.contact.messagePrefix} "${translatedName}" [N°${apartment.id}]`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <a
                  href={`https://t.me/residence_oasis?text=${encodeURIComponent(`${t.contact.messagePrefix} "${translatedName}" [N°${apartment.id}]`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTelegram className="w-4 h-4 mr-2" />
                  Telegram
                </a>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                <a href={`tel:+${apartment.contactPhone || "213561472990"}`}>
                  <FaPhone className="w-4 h-4 mr-2" />
                  {t.contact.phone}
                </a>
              </Button>
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
}

function InfoTile({ icon, label, value }: InfoTileProps) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
