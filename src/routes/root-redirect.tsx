import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, DEFAULT_LANG, isLang } from "@/lib/i18n";
import {
  buildFaqPage,
  buildLodgingBusiness,
  buildOrganization,
  buildWebSite,
} from "@/lib/jsonld";
import { contactInfo, googleMapsUrl, googleReviews } from "@/data/appData";

const HOME_FAQ = [
  {
    question: "Où se trouve la Résidence Oasis exactement ?",
    answer:
      "La résidence est située à Filfila, à 20 km à l'est de Skikda et à 100 km de Constantine. Plage Jeanne d'Arc à 700 m, complexes touristiques Rusica Park et Royal Tulip à proximité immédiate.",
  },
  {
    question: "Quels types d'appartements proposez-vous à Filfila ?",
    answer:
      "Sept appartements meublés : un studio (3 pers.), quatre F2 modernes (4 pers.), un F2 avec jacuzzi privatif et sauna (4 pers.), et un F3 de 132 m² avec terrasse privée (6 pers.). Tous équipés cuisine, climatisation neuve, Wi-Fi fibre 240 Mbps.",
  },
  {
    question: "Comment réserver depuis l'étranger ?",
    answer:
      "Réservation directe par WhatsApp (+213 5 61 47 29 90) ou Telegram (@residence_oasis). Acompte d'une nuit par virement CCP dans les 24 h, solde à l'arrivée en dinars algériens (DA) ou en euros (€). Aucune caution, aucun frais caché.",
  },
  {
    question: "Quels sont les tarifs ?",
    answer:
      "Les tarifs vont de 40 €/nuit (10 000 DA) pour le studio à 110 €/nuit (30 000 DA) pour le F3 avec terrasse privée. F2 standard à partir de 45 €/nuit, F2 avec jacuzzi à 70 €/nuit.",
  },
  {
    question: "Y a-t-il un appartement avec jacuzzi à Skikda ?",
    answer:
      "Oui, l'appartement F2 Jacuzzi & Sauna (44 m², 4 personnes) propose un jacuzzi privatif et un sauna intégrés à l'appartement. Disponible à Filfila à 700 m de la plage Jeanne d'Arc.",
  },
  {
    question: "Le Wi-Fi est-il rapide pour le télétravail ?",
    answer:
      "Oui, fibre optique 240 Mbps avec un modem dédié par étage pour répartir la charge. Adapté à Zoom, Google Meet, streaming 4K et appels vidéo simultanés.",
  },
];

/**
 * Root URL handler at "/".
 *
 * Two audiences:
 * 1. **Humans**: a JS `location.replace` jumps to their preferred locale on
 *    first paint (one hop, no history entry).
 * 2. **Bots without JS** (GPTBot, ClaudeBot, PerplexityBot, RoastMyUrl, ...):
 *    they see a fully rendered, content-rich landing page with valid title,
 *    H1, multilingual paragraphs and JSON-LD `LodgingBusiness` schema.
 *
 * Google still indexes `/fr/`, `/en/`, `/ar/` directly via the canonical link
 * + hreflang alternates — `/` resolves to the chosen canonical (no duplicate
 * content concern).
 */

const TITLE =
  "Résidence Oasis Skikda — Appartements meublés bord de mer Filfila";
const DESCRIPTION =
  "Résidence Oasis : 7 appartements meublés (studio, F2, F2 jacuzzi, F3 terrasse) en bord de mer à Filfila, Skikda. Wi-Fi fibre, climatisation, parking. Réservation directe par WhatsApp.";

export const meta: MetaFunction = () => {
  const ogImage = `${SITE_URL}/og/og-home.png`;
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { name: "robots", content: "index, follow" },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/${DEFAULT_LANG}/` },
    ...LOCALES.map((l) => ({
      tagName: "link" as const,
      rel: "alternate",
      hrefLang: l,
      href: `${SITE_URL}/${l}/`,
    })),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: `${SITE_URL}/${DEFAULT_LANG}/`,
    },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: TITLE },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}/` },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:locale:alternate", content: "en_US" },
    { property: "og:locale:alternate", content: "ar_DZ" },
    { property: "og:site_name", content: "Résidence Oasis" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: DESCRIPTION },
    { name: "twitter:image", content: ogImage },
    { "script:ld+json": buildWebSite() } as never,
    { "script:ld+json": buildOrganization() } as never,
    { "script:ld+json": buildLodgingBusiness() } as never,
    { "script:ld+json": buildFaqPage(HOME_FAQ) } as never,
  ];
};

const LANG_LINKS = [
  { code: "fr", label: "Français", url: "/fr/" },
  { code: "en", label: "English", url: "/en/" },
  { code: "ar", label: "العربية", url: "/ar/" },
] as const;

export default function RootRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let target: string = DEFAULT_LANG;
    try {
      const stored = window.localStorage.getItem("language");
      if (stored && isLang(stored)) {
        target = stored;
      } else {
        const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
        if (isLang(nav)) target = nav;
      }
    } catch {
      // localStorage unavailable (private mode, sandboxed iframe) → default lang.
    }
    window.location.replace(`/${target}/`);
  }, []);

  const addressLine = [
    contactInfo.address.street,
    contactInfo.address.locality,
    contactInfo.address.region,
    "Algérie",
  ]
    .filter(Boolean)
    .join(", ");
  const phoneDigits = contactInfo.phone.primary.replace(/[^+\d]/g, "");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto text-center">
      <header className="mb-10">
        <img
          src="/assets/logo-only-without-bg.avif"
          width={96}
          height={96}
          alt="Résidence Oasis"
          className="mx-auto mb-6"
          decoding="async"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Résidence Oasis Skikda
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Appartements meublés en bord de mer à Filfila, Skikda — Algérie.
          Furnished beachfront apartments. شقق مفروشة على البحر.
        </p>
      </header>

      <aside
        className="mb-10 flex flex-wrap items-center justify-center gap-3 text-sm"
        aria-label="Avis et présence en ligne"
      >
        <a
          href={googleReviews.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/40 bg-amber-50 text-amber-900 hover:bg-amber-100"
          aria-label={`Note Google ${googleReviews.rating} sur 5, basée sur ${googleReviews.count} avis`}
        >
          <span aria-hidden="true">★</span>
          <span className="font-semibold">{googleReviews.rating} / 5</span>
          <span className="text-xs">Google · {googleReviews.count} avis</span>
        </a>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/5"
        >
          📍 <span>Google Maps</span>
        </a>
        <a
          href={contactInfo.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/5"
        >
          f <span>Facebook</span>
        </a>
        <a
          href={contactInfo.social.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/5"
        >
          ✈ <span>Telegram</span>
        </a>
        <a
          href="https://www.airbnb.fr/rooms/1210309363040804447"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/5"
        >
          🏠 <span>Airbnb</span>
        </a>
      </aside>

      <nav
        aria-label="Choisir la langue / Choose language / اختر اللغة"
        className="mb-12"
      >
        <ul className="flex flex-wrap justify-center gap-3">
          {LANG_LINKS.map((l) => (
            <li key={l.code}>
              <a
                href={l.url}
                hrefLang={l.code}
                className="inline-block px-6 py-3 rounded-lg border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        className="grid gap-8 md:grid-cols-3 text-left text-sm"
        aria-label="Présentation"
      >
        <article lang="fr">
          <h2 className="text-base font-semibold mb-2">À propos</h2>
          <p>
            La Résidence Oasis regroupe sept appartements meublés (studio,
            F2, F2 avec jacuzzi privatif, F3 avec terrasse) à Filfila, à 20 km
            de Skikda et 100 km de Constantine. Wi-Fi fibre 240 Mbps,
            climatisation neuve, cuisine entièrement équipée, parking de rue.
            Plage Jeanne d'Arc à 700 m, complexes Rusica Park et Royal Tulip
            à proximité. Réservation directe par WhatsApp, acompte CCP d'une
            nuit, solde à l'arrivée en DA ou euros.
          </p>
        </article>
        <article lang="en">
          <h2 className="text-base font-semibold mb-2">About</h2>
          <p>
            Oasis Residence offers seven furnished apartments (studio, F2, F2
            with private jacuzzi, F3 with terrace) in Filfila, 20 km from
            Skikda and 100 km from Constantine. 240 Mbps fibre Wi-Fi, new air
            conditioning, fully equipped kitchen, street parking. Jeanne
            d'Arc beach 700 m away; Rusica Park and Royal Tulip resorts
            nearby. Direct booking via WhatsApp, one-night CCP deposit,
            balance on arrival in DZD or EUR.
          </p>
        </article>
        <article lang="ar" dir="rtl">
          <h2 className="text-base font-semibold mb-2">عن الإقامة</h2>
          <p>
            إقامة الواحة سبع شقق مفروشة (ستوديو، F2، F2 مع جاكوزي خاص، F3
            مع تراس) في فيلفيلا على بعد 20 كم من سكيكدة و100 كم من قسنطينة.
            واي فاي ألياف بصرية 240 ميغابت، تكييف جديد، مطبخ مجهز بالكامل،
            موقف سيارات. شاطئ جان دارك على بعد 700 متر، ومجمعا روسيكا بارك
            ورويال توليب قريبان. الحجز المباشر عبر واتساب، تأمين ليلة واحدة
            عبر البريد، الباقي عند الوصول.
          </p>
        </article>
      </section>

      <section
        className="mt-12 max-w-3xl mx-auto text-left"
        aria-label="Pourquoi choisir la Résidence Oasis"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Pourquoi la Résidence Oasis à Filfila
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>Aucune caution.</strong> Pas de blocage de carte, pas de
            frais cachés.
          </li>
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>Acompte CCP d'une nuit.</strong> Solde réglé à l'arrivée en
            DA ou en €.
          </li>
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>Propriétaire disponible.</strong> Réponse WhatsApp en moins
            d'une heure en haute saison.
          </li>
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>Wi-Fi fibre 240 Mbps.</strong> Modem dédié par étage —
            adapté Zoom, Meet, streaming 4K.
          </li>
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>F2 jacuzzi privatif &amp; sauna.</strong> Offre rare à
            Skikda, idéale couples ou cure thermale.
          </li>
          <li className="border-l-2 border-primary/30 pl-3">
            <strong>F3 132 m² avec terrasse privée.</strong> Jusqu'à 6
            personnes, parfait pour les familles élargies.
          </li>
        </ul>
      </section>

      <section
        className="mt-12 text-left max-w-3xl mx-auto"
        aria-label="Questions fréquentes"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Questions fréquentes sur Filfila et Skikda
        </h2>
        <dl className="space-y-4">
          {HOME_FAQ.map((qa) => (
            <div
              key={qa.question}
              className="border-l-2 border-primary/30 pl-4"
            >
              <dt className="font-medium text-sm">{qa.question}</dt>
              <dd className="text-sm text-muted-foreground mt-1">
                {qa.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <nav
        aria-label="Informations légales"
        className="mt-10 text-xs text-muted-foreground"
      >
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <li>
            <a
              href={`/${DEFAULT_LANG}/legal/mentions-legales/`}
              className="hover:text-primary"
            >
              Mentions légales
            </a>
          </li>
          <li>
            <a
              href={`/${DEFAULT_LANG}/legal/confidentialite/`}
              className="hover:text-primary"
            >
              Confidentialité
            </a>
          </li>
          <li>
            <a
              href={`/${DEFAULT_LANG}/legal/conditions/`}
              className="hover:text-primary"
            >
              Conditions
            </a>
          </li>
        </ul>
      </nav>

      <footer className="mt-8 text-xs text-muted-foreground">
        <p>
          {addressLine} · WhatsApp{" "}
          <a href={`https://wa.me/${phoneDigits.replace("+", "")}`}>
            {contactInfo.phone.primary}
          </a>
        </p>
      </footer>
    </main>
  );
}
