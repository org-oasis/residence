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
 * SEASON_RATES_DZD in src/data/pricing.ts. Styled with the site theme tokens
 * only (no gradients): sand panel, lagoon accents, the active season row
 * highlighted in secondary with a primary side rule. The row matching today's
 * season is computed safely for prerendering because the panel only renders
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
        className="w-full flex items-center justify-between bg-card border-border hover:bg-muted"
      >
        <span className="seasonal-pricing-title">{t.apartments.seasonalPricing}</span>
        {open ? (
          <ChevronUp className="w-6 h-6 text-primary" />
        ) : (
          <ChevronDown className="w-6 h-6 text-primary" />
        )}
      </Button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-muted/50 p-2 animate-fade-in">
          <ul className="space-y-0.5">
            {SEASON_DISPLAY_ORDER.map((season) => {
              const isActive = season === activeSeason;
              return (
                <li
                  key={season}
                  className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 border-l-[3px] ${
                    isActive ? "bg-secondary/60 border-primary" : "border-transparent"
                  }`}
                >
                  <span className="seasonal-pricing-date flex items-center gap-2">
                    {t.apartments.seasons[season]}
                    {isActive && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                        {t.apartments.currentPeriod}
                      </span>
                    )}
                  </span>
                  <span className="seasonal-pricing-price whitespace-nowrap">
                    {rateDzd(tier, season).toLocaleString("fr-DZ")} DA{" "}
                    <span className="text-muted-foreground text-xs font-normal">{night}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-border pt-2 text-center text-sm font-medium text-primary">
            {t.apartments.weeklyDiscount}
          </div>
        </div>
      )}
    </div>
  );
}
