import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

type ApartmentType = "Studio" | "F2" | "F2-jacuzzi" | "F3";

/** Seasonal nightly rate (DZD) per apartment tier and pricing tier. */
const SEASONAL_PRICES: Record<ApartmentType, { sept1to15: string; sept15plus: string; october: string }> = {
  Studio: { sept1to15: "7000 DA", sept15plus: "5500 DA", october: "4500 DA" },
  F2: { sept1to15: "8000 DA", sept15plus: "6000 DA", october: "5000 DA" },
  "F2-jacuzzi": { sept1to15: "13000 DA", sept15plus: "12000 DA", october: "10000 DA" },
  F3: { sept1to15: "20000 DA", sept15plus: "17000 DA", october: "13000 DA" },
};

interface Props {
  type: string;
  basePriceDz: number;
}

function priceFor(type: string): { sept1to15: string; sept15plus: string; october: string } {
  return (SEASONAL_PRICES[type as ApartmentType] ?? {
    sept1to15: "N/A",
    sept15plus: "N/A",
    october: "N/A",
  });
}

export default function SeasonalPricing({ type, basePriceDz }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const prices = priceFor(type);
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
          <PricingRow
            date={t.apartments.september1to15}
            badge={t.apartments.reduced}
            oldPrice={`${basePriceDz} DA`}
            newPrice={`${prices.sept1to15} ${night}`}
          />
          <PricingRow
            date={t.apartments.september15toEnd}
            badge={t.apartments.veryReduced}
            oldPrice={prices.sept1to15}
            newPrice={`${prices.sept15plus} ${night}`}
          />
          <div className="mt-3 pt-3 border-t border-blue-200">
            <PricingRow
              date={t.apartments.fromOctober}
              badge={t.apartments.extremelyReduced}
              newPrice={`${prices.october} ${night}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  date: string;
  badge: string;
  oldPrice?: string;
  newPrice: string;
}

function PricingRow({ date, badge, oldPrice, newPrice }: RowProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="seasonal-pricing-date">{date}</div>
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          {badge}
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          {oldPrice && (
            <span className="seasonal-pricing-price line-through text-gray-500">{oldPrice}</span>
          )}
          <span className="seasonal-pricing-price">{newPrice}</span>
        </div>
      </div>
    </div>
  );
}
