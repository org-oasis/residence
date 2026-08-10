import { describe, expect, test } from "bun:test";

import { allApartments, siteConfig } from "../src/data/appData.ts";
import { LOCALES } from "../src/lib/i18n.ts";
import {
  buildApartmentSchema,
  buildArticleSchema,
  buildBlogSchema,
  buildBreadcrumbList,
  buildFaqPage,
  buildLodgingBusiness,
  buildOrganization,
  buildWebSite,
} from "../src/lib/jsonld.ts";
import { buildMeta, SITE_URL } from "../src/lib/seo.ts";

/** Raw i18n keys such as "apartment3_name" must never reach the markup. */
const RAW_KEY = /apartment[0-9]+_(name|description)/;

const apartment = allApartments[0];

const sampleSchemas = () => ({
  WebSite: buildWebSite(),
  Organization: buildOrganization(),
  LodgingBusiness: buildLodgingBusiness(),
  BreadcrumbList: buildBreadcrumbList([
    { name: "Accueil", url: "/fr" },
    { name: "Appartements", url: `${SITE_URL}/fr/apartments` },
  ]),
  FAQPage: buildFaqPage([{ question: "Q ?", answer: "A." }]),
  Apartment: buildApartmentSchema({
    apartment,
    pathname: `/fr/apartments/${apartment.slug}/`,
    name: "Studio Deluxe",
    description: "Studio en bord de mer à Filfila.",
  }),
  Article: buildArticleSchema({
    url: `${SITE_URL}/fr/blog/plage-stora/`,
    headline: "Plage de Stora",
    description: "Guide de la plage de Stora.",
    image: "/og/og-home.png",
    datePublished: "2026-07-01",
    dateModified: "2026-07-02",
    inLanguage: "fr",
    keywords: ["stora", "plage"],
  }),
  Blog: buildBlogSchema(
    `${SITE_URL}/fr/blog/`,
    [
      {
        url: `${SITE_URL}/fr/blog/plage-stora/`,
        headline: "Plage de Stora",
        description: "Guide de la plage de Stora.",
        image: "/og/og-home.png",
        datePublished: "2026-07-01",
      },
    ],
    "fr",
  ),
});

/** Walk a JSON-LD tree and yield every [path, value] leaf. */
function* leaves(node, path = "$") {
  if (Array.isArray(node)) {
    for (const [i, child] of node.entries()) yield* leaves(child, `${path}[${i}]`);
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) yield* leaves(child, `${path}.${key}`);
    return;
  }
  yield [path, node];
}

describe("JSON-LD builders", () => {
  const schemas = sampleSchemas();

  test("every builder returns a serialisable object with @context and @type", () => {
    for (const [label, schema] of Object.entries(schemas)) {
      const serialised = JSON.stringify(schema);
      expect(serialised, label).toBeTypeOf("string");
      expect(JSON.parse(serialised), label).toBeTruthy();
      expect(schema["@context"], label).toBe("https://schema.org");
      // An entity may carry several types — an apartment is also a Product, so
      // that its price band is a valid property rather than a silently ignored one.
      expect([].concat(schema["@type"]), label).toContain(label);
    }
  });

  test("no JSON-LD value is NaN, Infinity or an empty string", () => {
    for (const [label, schema] of Object.entries(schemas)) {
      for (const [path, value] of leaves(schema)) {
        if (typeof value === "number") {
          expect(Number.isFinite(value), `${label} ${path}`).toBe(true);
        }
        if (typeof value === "string") {
          expect(value.trim().length, `${label} ${path}`).toBeGreaterThan(0);
        }
      }
    }
  });

  test("no price is zero or negative", () => {
    for (const [label, schema] of Object.entries(schemas)) {
      for (const [path, value] of leaves(schema)) {
        if (/\.price$/.test(path)) {
          expect(typeof value, `${label} ${path}`).toBe("number");
          expect(value, `${label} ${path}`).toBeGreaterThan(0);
        }
      }
    }
  });

  test("every absolute residence-oasis URL is canonical (trailing slash, no double slash)", () => {
    for (const [label, schema] of Object.entries(schemas)) {
      for (const [path, value] of leaves(schema)) {
        if (typeof value !== "string" || !value.startsWith(SITE_URL)) continue;
        const rest = value.slice(SITE_URL.length);
        expect(rest.includes("//"), `${label} ${path} → ${value}`).toBe(false);
        // Page URLs must end with "/"; anchors (#lodging) and asset files are exempt.
        const isAnchor = rest.startsWith("#");
        const isAsset = /\.[a-z0-9]{2,5}$/i.test(rest);
        if (rest !== "" && !isAnchor && !isAsset) {
          expect(rest.endsWith("/"), `${label} ${path} → ${value}`).toBe(true);
        }
      }
    }
  });

  test("buildBreadcrumbList numbers positions from 1 and absolutises relative URLs", () => {
    const crumbs = buildBreadcrumbList([
      { name: "Accueil", url: "/fr" },
      { name: "Blog", url: "/fr/blog/" },
      { name: "Article", url: `${SITE_URL}/fr/blog/plage-stora/` },
    ]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    for (const item of crumbs.itemListElement) {
      expect(item.item.startsWith("https://")).toBe(true);
      expect(item.item.endsWith("/")).toBe(true);
    }
  });

  test("buildApartmentSchema quotes a season price band in both currencies", () => {
    const schema = schemas.Apartment;
    const currencies = schema.offers.map((o) => o.priceCurrency);
    expect(currencies).toContain("EUR");
    expect(currencies).toContain("DZD");
    for (const offer of schema.offers) {
      // A single price would carry the base-season rate only, several times
      // below the summer one; the band has to span the whole grid.
      expect(offer.lowPrice, offer.priceCurrency).toBeGreaterThan(0);
      expect(offer.highPrice, offer.priceCurrency).toBeGreaterThanOrEqual(offer.lowPrice);
    }
    const dzd = schema.offers.find((o) => o.priceCurrency === "DZD");
    expect(dzd.lowPrice).toBe(apartment.pricedz);
    expect(schema.occupancy.maxValue).toBe(apartment.capacity);
  });

  test("no raw i18n key leaks into the apartment or article schemas", () => {
    for (const label of ["Apartment", "Article", "Blog", "WebSite", "Organization"]) {
      for (const [path, value] of leaves(schemas[label])) {
        if (typeof value === "string") {
          expect(RAW_KEY.test(value), `${label} ${path} → ${value}`).toBe(false);
        }
      }
    }
  });

  test("no raw i18n key leaks into the LodgingBusiness schema", () => {
    for (const [path, value] of leaves(buildLodgingBusiness())) {
      if (typeof value === "string") {
        expect(RAW_KEY.test(value), `${path} → ${value}`).toBe(false);
      }
    }
  });

  test("LodgingBusiness advertises one priced offer per apartment, none claiming stock", () => {
    const schema = schemas.LodgingBusiness;
    expect(schema.makesOffer).toHaveLength(allApartments.length);
    expect(schema.numberOfRooms).toBe(allApartments.length);
    for (const offer of schema.makesOffer) {
      // Availability lives in the booking calendar. Hardcoding `InStock` here
      // would be a claim the markup cannot honour, so it must stay absent.
      expect(offer.availability).toBeUndefined();
      expect(offer.lowPrice).toBeGreaterThan(0);
    }
    expect(schema.name).toBe(siteConfig.name);
  });
});

describe("buildMeta", () => {
  const findTag = (tags, predicate) => tags.find(predicate);
  const allTags = (tags, predicate) => tags.filter(predicate);

  test("canonical and og:url are the same trailing-slash absolute URL", () => {
    for (const lang of LOCALES) {
      for (const pathname of ["", "/", "/apartments", "apartments/", "/blog/plage-stora"]) {
        const tags = buildMeta({ lang, pathname, title: "T", description: "D" });
        const canonical = findTag(tags, (t) => t.rel === "canonical").href;
        const ogUrl = findTag(tags, (t) => t.property === "og:url").content;
        expect(canonical).toBe(ogUrl);
        expect(canonical.startsWith(`${SITE_URL}/${lang}/`)).toBe(true);
        expect(canonical.endsWith("/")).toBe(true);
        expect(canonical.slice(SITE_URL.length).includes("//")).toBe(false);
      }
    }
  });

  test("every locale plus x-default gets an hreflang alternate", () => {
    const tags = buildMeta({ lang: "fr", pathname: "/contact", title: "T", description: "D" });
    const alternates = allTags(tags, (t) => t.rel === "alternate");
    expect(alternates.map((t) => t.hrefLang)).toEqual([...LOCALES, "x-default"]);
    for (const alternate of alternates) {
      expect(alternate.href.endsWith("/contact/")).toBe(true);
    }
    // x-default points at the default locale.
    expect(alternates.at(-1).href).toBe(`${SITE_URL}/fr/contact/`);
  });

  test("relative OG images are absolutised, absolute ones left alone", () => {
    const relative = buildMeta({ lang: "en", pathname: "", title: "T", description: "D" });
    expect(findTag(relative, (t) => t.property === "og:image").content).toStartWith(SITE_URL);

    const absolute = buildMeta({
      lang: "en",
      pathname: "",
      title: "T",
      description: "D",
      image: "https://cdn.example.com/x.png",
    });
    expect(findTag(absolute, (t) => t.property === "og:image").content).toBe(
      "https://cdn.example.com/x.png",
    );
  });

  test("noindex flips the robots directive", () => {
    const indexed = buildMeta({ lang: "fr", pathname: "", title: "T", description: "D" });
    expect(findTag(indexed, (t) => t.name === "robots").content).toBe("index, follow");
    const hidden = buildMeta({
      lang: "fr",
      pathname: "",
      title: "T",
      description: "D",
      noindex: true,
    });
    expect(findTag(hidden, (t) => t.name === "robots").content).toBe("noindex, nofollow");
  });

  test("jsonLd payloads ride along as valid script:ld+json entries", () => {
    const tags = buildMeta({
      lang: "fr",
      pathname: "/apartments",
      title: "T",
      description: "D",
      jsonLd: [buildWebSite(), buildOrganization()],
    });
    const scripts = allTags(tags, (t) => "script:ld+json" in t);
    expect(scripts).toHaveLength(2);
    for (const script of scripts) {
      expect(() => JSON.parse(JSON.stringify(script["script:ld+json"]))).not.toThrow();
    }
  });

  test("no raw i18n key reaches any meta tag", () => {
    const tags = buildMeta({
      lang: "fr",
      pathname: "/apartments",
      title: "Nos appartements",
      description: "Sept logements en bord de mer.",
      jsonLd: [buildWebSite(), buildOrganization()],
    });
    for (const [path, value] of leaves(tags)) {
      if (typeof value === "string") {
        expect(RAW_KEY.test(value), `${path} → ${value}`).toBe(false);
      }
    }
  });
});
