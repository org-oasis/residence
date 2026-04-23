import type { ReactElement } from "react";
import {
  Bath,
  CookingPot,
  Wifi,
  Tv,
  Snowflake,
  WashingMachine,
  Balcony,
  HotTub,
  Oven,
  Stove,
  Microwave,
  Refrigerator,
  Dishwasher,
  Parking,
  Sauna,
  Blinds,
  Utensils,
  type IconProps,
} from "@/components/icons";

type IconComponent = (props: IconProps) => ReactElement;

/**
 * Map a feature (in any supported locale) to an SVG icon component.
 * Icons come from `src/components/icons/` — no third-party icon library.
 */
export const getFeatureIcon = (
  feature: string,
  size: string = "h-6 w-6",
): ReactElement => {
  const iconClass = size;
  const Component = resolveIcon(feature);
  return <Component className={iconClass} />;
};

function resolveIcon(feature: string): IconComponent {
  switch (feature.toLowerCase()) {
    case "bathroom":
    case "salle de bain":
      return Bath;

    case "kitchen":
    case "full kitchen":
    case "cuisine":
    case "cuisine complète":
      return CookingPot;

    case "wi-fi":
    case "wifi":
      return Wifi;

    case "tv":
      return Tv;

    case "air conditioning":
    case "climatisation":
      return Snowflake;

    case "washing machine":
    case "machine à laver":
      return WashingMachine;

    case "balcony":
    case "terrace":
    case "balcon":
    case "terrasse":
    case "private balcony":
    case "balcon privé":
      return Balcony;

    case "jacuzzi":
      return HotTub;

    case "oven":
    case "four":
      return Oven;

    case "stove":
    case "plaque de cuisson":
      return Stove;

    case "microwave":
    case "micro-ondes":
      return Microwave;

    case "refrigerator":
    case "frigo":
    case "réfrigérateur":
      return Refrigerator;

    case "freezer":
    case "congélateur":
      return Snowflake;

    case "dishwasher":
    case "lave-vaisselle":
      return Dishwasher;

    case "sauna":
      return Sauna;

    case "parking":
      return Parking;

    case "electric shutters":
    case "volets électriques":
    case "volets electriques":
      return Blinds;

    default:
      return Utensils;
  }
}
