import type { ApartmentProps } from "@/components/ApartmentCard";
import {
  allApartments,
  contactInfo,
  googleMapsUrl,
  siteConfig,
} from "@/data/appData";
import {
  eurFrom,
  SEASON_RATES_DZD,
  tierForType,
  type TierKey,
} from "@/data/pricing";
import { DEFAULT_LANG, dictFor, type Lang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

const RESIDENCE_AMENITIES = [
  "Wi-Fi",
  "Air conditioning",
  "Free parking",
  "Equipped kitchen",
  "Washing machine",
  "Beach access (700 m)",
  "Family friendly",
  "Long-term stays welcome",
] as const;

function ensureTrailingSlash(url: string): string {
  // Skip if URL has a query/hash, or already ends with `/`.
  if (url.endsWith("/")) return url;
  if (url.includes("?") || url.includes("#")) return url;
  return `${url}/`;
}

const SITE_HOME = ensureTrailingSlash(SITE_URL);

/** Nightly rate envelope of a tier across the whole year, in DZD. */
function seasonRangeDzd(tier: TierKey): { low: number; high: number } {
  const rates = Object.values(SEASON_RATES_DZD).map((r) => r[tier]);
  return { low: Math.min(...rates), high: Math.max(...rates) };
}

const SEASON_COUNT = Object.keys(SEASON_RATES_DZD).length;

const ALL_RATES_DZD = Object.values(SEASON_RATES_DZD).flatMap((r) =>
  Object.values(r),
);

/**
 * Nightly price band for one tier, published as AggregateOffer. A single
 * `price` would only carry the base-season rate — up to three times below the
 * summer rate — which reads as a wrong price in a rich result.
 * No `availability`: real availability comes from the booking calendar, so a
 * hardcoded `InStock` would be a claim the markup cannot honour.
 */
function buildAggregateOffer(
  tier: TierKey,
  currency: "EUR" | "DZD",
  url: string,
): JsonLd {
  const { low, high } = seasonRangeDzd(tier);
  const lowPrice = currency === "EUR" ? eurFrom(low) : low;
  const highPrice = currency === "EUR" ? eurFrom(high) : high;
  return {
    "@type": "AggregateOffer",
    priceCurrency: currency,
    lowPrice,
    highPrice,
    offerCount: SEASON_COUNT,
    url,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      minPrice: lowPrice,
      maxPrice: highPrice,
      priceCurrency: currency,
      unitCode: "DAY",
    },
  };
}

/** `apt.name` is a translation key in appData — resolve it before publishing. */
function apartmentName(apartment: ApartmentProps, lang: Lang): string {
  const t = dictFor(lang);
  return (
    t.apartmentNames[apartment.name as keyof typeof t.apartmentNames] ||
    apartment.name
  );
}

export function buildWebSite(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: siteConfig.name,
    url: SITE_HOME,
    inLanguage: ["fr-FR", "en-US", "ar-DZ"],
    publisher: { "@id": `${SITE_URL}#lodging` },
  };
}

export function buildLodgingBusiness(lang: Lang = DEFAULT_LANG): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}#lodging`,
    name: siteConfig.name,
    url: SITE_HOME,
    image: `${SITE_URL}${siteConfig.heroImage}`,
    logo: `${SITE_URL}${siteConfig.logoOnly}`,
    telephone: contactInfo.phone.primary.split("(")[0].trim(),
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address.street,
      addressLocality: contactInfo.address.locality,
      addressRegion: contactInfo.address.region,
      postalCode: contactInfo.address.postalCode,
      addressCountry: contactInfo.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contactInfo.geo.latitude,
      longitude: contactInfo.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    checkinTime: "14:00",
    checkoutTime: "12:00",
    numberOfRooms: allApartments.length,
    currenciesAccepted: "DZD, EUR",
    paymentAccepted: "CCP transfer, Cash",
    availableLanguage: ["fr", "en", "ar"],
    petsAllowed: false,
    smokingAllowed: false,
    // Spans the whole season grid, not just the base tier: the summer rate is
    // several times the low-season one and must be inside the advertised range.
    priceRange: `€${eurFrom(Math.min(...ALL_RATES_DZD))}–€${eurFrom(Math.max(...ALL_RATES_DZD))}`,
    // No aggregateRating on purpose: Google does not accept a business
    // publishing a rating about itself, and a wrong one risks a manual action
    // against every rich result on the domain. The real score stays visible on
    // the page and on the Google listing linked from sameAs.
    amenityFeature: RESIDENCE_AMENITIES.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    makesOffer: allApartments.map((apt) => ({
      // Points at the on-site listing, which is the canonical page for this
      // offer; the Airbnb links stay in the UI but are not the offer URL.
      ...buildAggregateOffer(
        tierForType(apt.type),
        "EUR",
        ensureTrailingSlash(`${SITE_URL}/${lang}/apartments/${apt.slug}`),
      ),
      itemOffered: {
        "@type": "Accommodation",
        name: apartmentName(apt, lang),
        accommodationCategory: apt.type,
        floorSize: {
          "@type": "QuantitativeValue",
          value: apt.size,
          unitCode: "MTK",
        },
        occupancy: {
          "@type": "QuantitativeValue",
          maxValue: apt.capacity,
        },
      },
    })),
    sameAs: [
      googleMapsUrl,
      contactInfo.social.facebook,
      contactInfo.social.telegram,
      ...allApartments.map((a) => a.airbnbLink),
    ].filter(Boolean),
  };
}

/**
 * Organisation schema — separate from LodgingBusiness so AI auditors can pick
 * up an explicit "brand" entity. Limits sameAs to owned channels.
 */
export function buildOrganization(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: siteConfig.name,
    url: SITE_HOME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${siteConfig.logo}`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contactInfo.phone.primary.split("(")[0].trim(),
      contactType: "Reservations",
      areaServed: ["DZ", "FR", "EU"],
      availableLanguage: ["fr", "en", "ar"],
    },
    sameAs: [
      googleMapsUrl,
      contactInfo.social.facebook,
      contactInfo.social.telegram,
    ].filter(Boolean),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      // Append trailing slash so the URL matches the canonical (avoids GH Pages 301).
      item: ensureTrailingSlash(
        item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
      ),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPage(items: FaqItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface ApartmentSchemaInput {
  apartment: ApartmentProps;
  pathname: string;
  name: string;
  description: string;
}

export interface ArticleSchemaInput {
  url: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  authorName?: string;
  keywords?: string[];
}

export function buildArticleSchema({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  inLanguage,
  authorName = "Résidence Oasis",
  keywords = [],
}: ArticleSchemaInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
    datePublished,
    dateModified,
    inLanguage,
    keywords: keywords.length ? keywords.join(", ") : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": ensureTrailingSlash(url),
    },
    author: { "@type": "Organization", name: authorName, url: SITE_HOME },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${siteConfig.logo}`,
      },
    },
  };
}

export interface BlogPostingItem {
  url: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
}

export function buildBlogSchema(
  blogUrl: string,
  posts: BlogPostingItem[],
  inLanguage: string,
): JsonLd {
  const url = ensureTrailingSlash(blogUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": url,
    url,
    name: `${siteConfig.name} — Blog`,
    inLanguage,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_HOME,
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.headline,
      description: p.description,
      image: p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`,
      datePublished: p.datePublished,
      url: ensureTrailingSlash(p.url),
    })),
  };
}

export function buildApartmentSchema({
  apartment,
  pathname,
  name,
  description,
}: ApartmentSchemaInput): JsonLd {
  const url = ensureTrailingSlash(`${SITE_URL}${pathname}`);
  const images = apartment.images.map((src) => `${SITE_URL}${src}`);

  return {
    "@context": "https://schema.org",
    // `offers` belongs to Product, not Apartment: without the second type the
    // whole price block is dropped by validators.
    "@type": ["Apartment", "Product"],
    "@id": url,
    name,
    description,
    url,
    image: images,
    floorSize: {
      "@type": "QuantitativeValue",
      value: apartment.size,
      unitCode: "MTK",
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: apartment.capacity,
    },
    accommodationCategory: apartment.type,
    amenityFeature: apartment.features.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
    containedInPlace: {
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}#lodging`,
      name: siteConfig.name,
    },
    offers: (["EUR", "DZD"] as const).map((currency) =>
      buildAggregateOffer(tierForType(apartment.type), currency, url),
    ),
  };
}
