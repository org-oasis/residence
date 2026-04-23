import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApartmentCard from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApartmentFilters } from "@/hooks/useApartmentFilters";
import { allApartments, PRICE_EUR_MIN, PRICE_EUR_MAX, COMMON_FEATURES } from "@/data/appData";
import { getFeatureIcon } from "@/lib/iconUtils";
import { ChevronDown, ChevronUp, Filter } from "@/components/icons";
import type { MetaFunction } from "react-router";
import { dictFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { buildBreadcrumbList } from "@/lib/jsonld";

export const meta: MetaFunction = ({ params }) => {
  const lang: Lang = isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = dictFor(lang);
  return buildMeta({
    lang,
    pathname: "/apartments",
    title: t.seo.apartments.title,
    description: t.seo.apartments.description,
    image: "/og/og-apartments.png",
    jsonLd: [
      buildBreadcrumbList([
        { name: t.nav.home, url: `/${lang}` },
        { name: t.nav.apartments, url: `/${lang}/apartments` },
      ]),
    ],
  });
};

export default function Apartments() {
  const { t } = useLanguage();
  const filters = useApartmentFilters();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const {
    typeFilter,
    floorFilter,
    priceMax,
    capacityMin,
    setTypeFilter,
    setFloorFilter,
    setPriceMax,
    setCapacityMin,
    reset: resetFilters,
    filtered: filteredApartments,
    floorOptions: floors,
  } = filters;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="relative py-10 bg-linear-to-r from-sea-light to-white overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t.apartments.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {t.apartments.subtitle}
              </p>

              {/* Common features bandeau — évite la duplication sur chaque card. Seuls les features spécifiques (jacuzzi, terrasse, etc.) restent visibles sur chaque logement. */}
              <div className="mt-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
                  {t.apartments.commonFeaturesTitle}
                </div>
                <ul className="flex flex-wrap items-center justify-center gap-2">
                  {COMMON_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="inline-flex items-center gap-1.5 text-sm bg-white/70 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full"
                    >
                      <span className="text-primary">{getFeatureIcon(feature, "h-6 w-6")}</span>
                      <span>{t.features[feature as keyof typeof t.features] || feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-10">
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute top-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>

        {/* Filter Toggle Section */}
        <section className="py-6 border-b">
          <div className="container">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6" />
                <span className="font-medium">{t.apartments.filters.showing} {filteredApartments.length} {t.apartments.filters.of} {allApartments.length} {t.apartments.filters.accommodations}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                {showFilters ? (
                  <>
                    <ChevronUp className="w-6 h-6" />
                    {t.apartments.filters.hideFilters}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-6 h-6" />
                    {t.apartments.filters.showFilters}
                  </>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Section */}
            {showFilters && (
              <div className="mt-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Apartment Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.labels.type}
                    </label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.labels.type} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.apartments.filters.allTypes}</SelectItem>
                        <SelectItem value="Studio">{t.apartmentTypes.Studio}</SelectItem>
                        <SelectItem value="F2">{t.apartmentTypes.F2}</SelectItem>
                        <SelectItem value="F3">{t.apartmentTypes.F3}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Floor Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.apartments.filters.floor}
                    </label>
                    <Select value={floorFilter} onValueChange={setFloorFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.apartments.filters.floor} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.apartments.filters.allFloors}</SelectItem>
                        {floors.filter(f => f !== "all").map(floor => (
                          <SelectItem key={floor} value={floor}>
                            {t.floors[floor as keyof typeof t.floors] || floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity Filter — P1 Karim et P3 Fatima cherchent "6+ personnes" */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.apartments.filters.minCapacity}
                    </label>
                    <Select value={capacityMin} onValueChange={setCapacityMin}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.apartments.filters.allCapacities} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t.apartments.filters.allCapacities}</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="6">6+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range — un seul slider (€ canonique, DZD suit le tier) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.apartments.filters.priceRange}: ≤ €{priceMax}
                    </label>
                    <Slider
                      defaultValue={[PRICE_EUR_MAX]}
                      min={PRICE_EUR_MIN}
                      max={PRICE_EUR_MAX}
                      step={5}
                      value={[priceMax]}
                      onValueChange={([val]) => setPriceMax(val)}
                      className="my-4"
                    />
                  </div>

                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetFilters();
                    }}
                  >
                    {t.apartments.filters.resetFilters}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Apartments Grid */}
        <section className="section py-10">
          <div className="container">
            {filteredApartments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredApartments.map((apartment) => (
                  <ApartmentCard key={apartment.id} apartment={apartment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <h3 className="text-xl font-semibold mb-2">{t.apartments.filters.noMatch}</h3>
                <p className="text-muted-foreground mb-6">{t.apartments.filters.adjustFilters}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetFilters();
                  }}
                >
                  {t.apartments.filters.resetFilters}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
