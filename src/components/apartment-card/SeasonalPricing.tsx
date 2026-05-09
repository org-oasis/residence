import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  SEASON_DISPLAY_ORDER,
  currentSeasonKey,
  rateDzd,
  tierForType,
} from "@/data/pricing";

interface Props {
  /** Apartment type as stored in appData (e.g. "Studio", "F2-jacuzzi"). */
  type: string;
}

/**
 * Collapsible seasonal rate grid for one apartment tier, driven entirely by
 * SEASON_RATES_DZD in src/data/pricing.ts. The row matching today's season is
 * highlighted; this is safe for prerendering because the panel only renders
 * after a client-side click (open starts false).
 */
export default function SeasonalPricing({ type }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const tier = tierForType(type);
  const activeSeason = currentSeasonKey();
  const night = `/ ${t.booking.summary.night}`;

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-linear-to-r from-blue-50 to-teal-50 border border-blue-100 hover:from-blue-100 hover:to-teal-100"
      >
        <span className="seasonal-pricing-title">{t.apartments.seasonalPricing}</span>
        {open ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </Button>

      {open && (
        <div className="mt-2 p-4 bg-linear-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100 animate-fade-in">
          <ul className="space-y-1">
            {SEASON_DISPLAY_ORDER.map((season) => {
              const isActive = season === activeSeason;
              return (
                <li
                  key={season}
                  className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 ${
                    isActive ? "bg-white/80 ring-1 ring-emerald-300" : ""
                  }`}
                >
                  <span className="seasonal-pricing-date flex items-center gap-2">
                    {t.apartments.seasons[season]}
                    {isActive && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        {t.apartments.currentPeriod}
                      </span>
                    )}
                  </span>
                  <span className="seasonal-pricing-price whitespace-nowrap">
                    {rateDzd(tier, season).toLocaleString("fr-DZ")} DA{" "}
                    <span className="text-gray-500 text-xs">{night}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 pt-3 border-t border-blue-200 text-center text-sm font-medium text-emerald-700">
            {t.apartments.weeklyDiscount}
          </div>
        </div>
      )}
    </div>
  );
}
