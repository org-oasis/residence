import type { ApartmentProps } from "@/components/ApartmentCard";
import {
  allApartments,
  contactInfo,
  googleMapsUrl,
  googleReviews,
  PRICE_EUR_MAX,
  PRICE_EUR_MIN,
  siteConfig,
} from "@/data/appData";
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

export function buildWebSite(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: siteConfig.name,
    url: SITE_URL,
    inLanguage: ["fr-FR", "en-US", "ar-DZ"],
    publisher: { "@id": `${SITE_URL}#lodging` },
  };
}

export function buildLodgingBusiness(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}#lodging`,
    name: siteConfig.name,
    url: SITE_URL,
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
    priceRange: `€${PRICE_EUR_MIN}–€${PRICE_EUR_MAX}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: googleReviews.rating,
      reviewCount: googleReviews.count,
      bestRating: 5,
      worstRating: 1,
    },
    amenityFeature: RESIDENCE_AMENITIES.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    makesOffer: allApartments.map((apt) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Accommodation",
        name: apt.name,
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
      price: apt.priceeur,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/fr/apartments/${apt.slug}/`,
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
    url: SITE_URL,
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

function ensureTrailingSlash(url: string): string {
  // Skip if URL has a query/hash, or already ends with `/`.
  if (url.endsWith("/")) return url;
  if (url.includes("?") || url.includes("#")) return url;
  return `${url}/`;
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
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: authorName, url: SITE_URL },
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
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": blogUrl,
    url: blogUrl,
    name: `${siteConfig.name} — Blog`,
    inLanguage,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.headline,
      description: p.description,
      image: p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`,
      datePublished: p.datePublished,
      url: p.url,
    })),
  };
}

export function buildApartmentSchema({
  apartment,
  pathname,
  name,
  description,
}: ApartmentSchemaInput): JsonLd {
  const url = `${SITE_URL}${pathname}`;
  const images = apartment.images.map((src) => `${SITE_URL}${src}`);

  return {
    "@context": "https://schema.org",
    "@type": "Apartment",
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
    offers: [
      {
        "@type": "Offer",
        price: apartment.priceeur,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: apartment.airbnbLink,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: apartment.priceeur,
          priceCurrency: "EUR",
          unitCode: "DAY",
        },
      },
      {
        "@type": "Offer",
        price: apartment.pricedz,
        priceCurrency: "DZD",
        availability: "https://schema.org/InStock",
        url: apartment.airbnbLink,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: apartment.pricedz,
          priceCurrency: "DZD",
          unitCode: "DAY",
        },
      },
    ],
  };
}
