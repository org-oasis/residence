import type { ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Balcony,
  Blinds,
  Dishwasher,
  HotTub,
  Microwave,
  Sauna,
  type IconProps,
} from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

type IconComponent = (props: IconProps) => ReactElement;

/**
 * Specific-feature → icon map. Multiple feature names can collapse onto the same
 * icon (Terrace + Private Balcony + Balcony all show as a single Balcony icon).
 */
const FEATURE_ICON_MAP: Record<string, { Icon: IconComponent; mergeKey: string }> = {
  Jacuzzi: { Icon: HotTub, mergeKey: "jacuzzi" },
  Sauna: { Icon: Sauna, mergeKey: "sauna" },
  Dishwasher: { Icon: Dishwasher, mergeKey: "dishwasher" },
  "Electric Shutters": { Icon: Blinds, mergeKey: "shutters" },
  Microwave: { Icon: Microwave, mergeKey: "microwave" },
  Terrace: { Icon: Balcony, mergeKey: "balcony" },
  "Private Balcony": { Icon: Balcony, mergeKey: "balcony" },
  Balcony: { Icon: Balcony, mergeKey: "balcony" },
};

const MAX_VISIBLE = 4;

interface Props {
  /** Specific (non-common) features for this apartment, e.g. ["Jacuzzi", "Sauna"]. */
  features: string[];
}

export default function OverlayFeatures({ features }: Props) {
  const { t } = useLanguage();

  const groups = (() => {
    const seen = new Map<string, { Icon: IconComponent; labels: string[] }>();
    for (const f of features) {
      const entry = FEATURE_ICON_MAP[f];
      if (!entry) continue;
      const translated = t.features[f as keyof typeof t.features] || f;
      const existing = seen.get(entry.mergeKey);
      if (existing) existing.labels.push(translated);
      else seen.set(entry.mergeKey, { Icon: entry.Icon, labels: [translated] });
    }
    return Array.from(seen.values()).slice(0, MAX_VISIBLE);
  })();

  if (groups.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {groups.map((group, i) => {
        const label = group.labels.join(" · ");
        return (
          <Tooltip key={i}>
            <TooltipTrigger
              type="button"
              className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/25 cursor-help shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={label}
            >
              <group.Icon className="h-6 w-6" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent className="text-xs">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
