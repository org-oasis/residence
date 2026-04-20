import type { ApartmentProps } from "@/components/ApartmentCard";
import { allApartments, contactInfo, siteConfig } from "@/data/appData";
import { SITE_URL } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

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
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address.street,
      addressLocality: contactInfo.address.city,
      addressCountry: "DZ",
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
    sameAs: [
      contactInfo.social.facebook,
      contactInfo.social.telegram,
      ...allApartments.map((a) => a.airbnbLink),
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
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
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
