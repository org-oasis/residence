import { useState, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router";
import { useLocalizedHref } from "@/lib/i18n";
import { COMMON_FEATURES } from "@/data/appData";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Calendar,
  Images,
  Info,
  Parking,
  Snowflake,
  Users,
  Wifi,
} from "@/components/icons";
import OverlayFeatures from "./apartment-card/OverlayFeatures";
import SeasonalPricing from "./apartment-card/SeasonalPricing";
import ContactButtons from "./apartment-card/ContactButtons";

const CalendarAvailability = lazy(() => import("./CalendarAvailability"));

export interface ApartmentProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceeur: number;
  pricedz: number;
  capacity: number;
  size: number;
  image: string;
  images: string[];
  floor: number;
  type: string;
  features: string[];
  airbnbLink?: string;
  contactPhone?: string;
}

export default function ApartmentCard({ apartment }: { apartment: ApartmentProps }) {
  const { t } = useLanguage();
  const loc = useLocalizedHref();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const translatedName =
    t.apartmentNames[apartment.name as keyof typeof t.apartmentNames] || apartment.name;
  const translatedDescription =
    t.apartmentDescriptionsShort[
      apartment.description as keyof typeof t.apartmentDescriptionsShort
    ] || "";
  const detailHref = loc(`/apartments/${apartment.slug}`);
  const goToDetail = () => navigate(detailHref);

  const specificFeatures = apartment.features.filter(
    (f) => !(COMMON_FEATURES as readonly string[]).includes(f),
  );

  const apartmentLabel =
    t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] ||
    `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl bg-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-64">
        {/* Apartment number — top-left */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-secondary text-secondary-foreground font-semibold text-xs px-2 py-1 rounded-full shadow-xs border border-secondary/20">
            N°{apartment.id}
          </div>
        </div>

        <OverlayFeatures features={specificFeatures} />

        <img
          src={apartment.image}
          alt={translatedName}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 cursor-pointer",
            isHovered ? "scale-110" : "scale-100",
          )}
          onClick={goToDetail}
        />

        {/* Overlay — title (left) + capacity (right) */}
        <div
          className="absolute inset-0 bg-linear-to-b from-transparent to-black/60 flex items-end p-6 cursor-pointer"
          onClick={goToDetail}
        >
          <div className="w-full flex items-end justify-between gap-3">
            <h3 className="text-white text-xl font-bold leading-tight text-left">
              {translatedName}
            </h3>
            <div className="text-right shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-end gap-1.5 text-white text-sm cursor-help"
                    aria-label={t.apartments.capacityPolicy.ariaLabel}
                  >
                    <Users className="h-6 w-6" />
                    <span>
                      {apartment.capacity} {t.apartments.filters.guests}
                    </span>
                    <Info className="h-3 w-3 opacity-75" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs leading-snug">
                  {t.apartments.capacityPolicy.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 bg-muted/30 border-y text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Snowflake className="w-6 h-6 text-emerald-600" />
          {t.apartments.trust.gatedResidence}
        </span>
        <span className="text-muted-foreground/40" aria-hidden="true">
          ·
        </span>
        <span className="inline-flex items-center gap-1">
          <Parking className="w-6 h-6 text-emerald-600" />
          {t.apartments.trust.freeParking}
        </span>
        <span className="text-muted-foreground/40" aria-hidden="true">
          ·
        </span>
        <span className="inline-flex items-center gap-1">
          <Wifi className="w-6 h-6 text-emerald-600" />
          {t.apartments.trust.fastWifi}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {translatedDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {translatedDescription}
          </p>
        )}

        {/* Price — DA first, € + per-person secondary */}
        <div className="flex flex-col items-center pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {apartment.pricedz.toLocaleString("fr-DZ")} DA
            </span>
            <span className="text-muted-foreground text-sm">/ {t.booking.summary.night}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ≈ €{apartment.priceeur} · ~
            {Math.round(apartment.pricedz / apartment.capacity).toLocaleString("fr-DZ")} DA /{" "}
            {t.apartments.perPerson}
          </div>
        </div>

        <SeasonalPricing type={apartment.type} basePriceDz={apartment.pricedz} />

        <hr className="my-4" />

        <div className="flex flex-row justify-center gap-3">
          <Button asChild className="btn-primary flex-1 min-w-0 [&_svg]:size-6">
            <Link viewTransition to={detailHref}>
              <Images className="mr-2 shrink-0" />
              <span className="truncate">{t.apartments.filters.viewDetails}</span>
            </Link>
          </Button>
          <Button
            className="btn-primary bg-green-700 hover:bg-green-800 text-white flex-1 min-w-0 [&_svg]:size-6"
            onClick={() => setCalendarOpen(true)}
            onMouseEnter={() => {
              void import("./CalendarAvailability");
            }}
            onFocus={() => {
              void import("./CalendarAvailability");
            }}
          >
            <Calendar className="mr-2 shrink-0" />
            <span className="truncate">{t.apartments.availability || "Availability"}</span>
          </Button>
        </div>

        <hr className="my-4" />

        <ContactButtons
          apartmentId={apartment.id}
          apartmentName={translatedName}
          airbnbLink={apartment.airbnbLink}
          contactPhone={apartment.contactPhone}
        />
      </div>

      {/* Calendar modal — direct open, fade animations via CSS override */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="w-fit max-w-[95vw] p-0">
          <DialogHeader className="px-4 py-3 text-center sm:text-center">
            <DialogTitle className="text-center sm:text-center">
              {t.apartments.availability || "Availability"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <Suspense fallback={null}>
              <CalendarAvailability apartmentId={apartment.id} apartmentName={apartmentLabel} />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
