import { useMemo, useState } from "react";
import { allApartments, PRICE_EUR_MAX } from "@/data/appData";
import type { ApartmentProps } from "@/components/ApartmentCard";

export interface ApartmentFiltersState {
  typeFilter: string;
  floorFilter: string;
  priceMax: number;
  capacityMin: string;
}

export interface ApartmentFilters extends ApartmentFiltersState {
  setTypeFilter: (v: string) => void;
  setFloorFilter: (v: string) => void;
  setPriceMax: (v: number) => void;
  setCapacityMin: (v: string) => void;
  reset: () => void;
  filtered: ApartmentProps[];
  /** Sorted unique floor values (as strings) plus the "all" sentinel. */
  floorOptions: string[];
}

const INITIAL: ApartmentFiltersState = {
  typeFilter: "all",
  floorFilter: "all",
  priceMax: PRICE_EUR_MAX,
  capacityMin: "any",
};

/**
 * Derives the filtered apartment list from the active filter state.
 * Uses `useMemo` (no useEffect/setState chain) for predictable data flow.
 */
export function useApartmentFilters(): ApartmentFilters {
  const [typeFilter, setTypeFilter] = useState(INITIAL.typeFilter);
  const [floorFilter, setFloorFilter] = useState(INITIAL.floorFilter);
  const [priceMax, setPriceMax] = useState(INITIAL.priceMax);
  const [capacityMin, setCapacityMin] = useState(INITIAL.capacityMin);

  const filtered = useMemo<ApartmentProps[]>(() => {
    return allApartments.filter((apt) => {
      if (typeFilter !== "all" && !apt.type.includes(typeFilter)) return false;
      if (floorFilter !== "all" && apt.floor !== Number(floorFilter)) return false;
      if (apt.priceeur > priceMax) return false;
      if (capacityMin !== "any" && apt.capacity < parseInt(capacityMin, 10)) return false;
      return true;
    });
  }, [typeFilter, floorFilter, priceMax, capacityMin]);

  const floorOptions = useMemo(
    () => ["all", ...Array.from(new Set(allApartments.map((a) => String(a.floor)))).sort()],
    [],
  );

  return {
    typeFilter,
    floorFilter,
    priceMax,
    capacityMin,
    setTypeFilter,
    setFloorFilter,
    setPriceMax,
    setCapacityMin,
    reset: () => {
      setTypeFilter(INITIAL.typeFilter);
      setFloorFilter(INITIAL.floorFilter);
      setPriceMax(INITIAL.priceMax);
      setCapacityMin(INITIAL.capacityMin);
    },
    filtered,
    floorOptions,
  };
}
