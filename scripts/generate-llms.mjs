// Generates public/llms.txt from the current site + blog content.
// Runs at prebuild. Output is git-ignored.
// Re-runs weekly via GitHub Actions cron so new blog articles appear automatically.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { allApartments, contactInfo, siteConfig } from "../src/data/appData.ts";
import {
  EXTRA_PERSON_FEE,
  SEASON_DISPLAY_ORDER,
  SEASON_RATES_DZD,
  WEEKLY_DISCOUNT_MIN_NIGHTS,
  WEEKLY_DISCOUNT_PCT,
  eurFrom,
} from "../src/data/pricing.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT = join(ROOT, "public", "llms.txt");
const SITE = "https://residence-oasis.com";

/** French labels for the pricing periods declared in pricing.ts. */
const SEASON_LABELS = {
  juneEarly: "1 – 15 juin",
  juneLate: "15 – 30 juin",
  summer: "juillet – août (haute saison)",
  septEarly: "1 – 15 septembre",
  septLate: "15 – 30 septembre",
  base: "reste de l'année",
};

const TIER_LABELS = {
  studio: "Studio",
  f2: "F2",
  f2jacuzzi: "F2 jacuzzi & sauna",
  f3: "F3 terrasse privative",
};

/**
 * Distances from the residence. Collo and Cap Bougaroun are covered by dozens
 * of articles but were missing here, so an agent had no way to place them.
 */
const NEARBY_PLACES = [
  ["Mer / plage la plus proche", "700 m, accessible à pied"],
  ["Plages de Filfila", "environ 2 km"],
  ["Complexes Rusica Park, Royal Tulip et Marina d'Or Water Park", "secteur immédiat"],
  ["Plage Larbi Ben M'hidi (ex-Jeanne d'Arc)", "environ 7 km"],
  ["Centre-ville de Skikda", "environ 20 km"],
  ["Port et village de Stora", "environ 20 minutes en voiture"],
  ["Sentier de randonnée Stora – La Carrière", "environ 30 minutes de marche"],
  ["Collo et son littoral sauvage", "environ 85 km, 1 h 30 de route (excursion à la journée)"],
  ["Cap Bougaroun et son phare", "environ 110 km, 2 h de route (excursion à la journée)"],
  ["Constantine et son aéroport Mohamed Boudiaf", "environ 100 km"],
  ["Annaba et son aéroport Rabah Bitat", "environ 110 km"],
];

function fileExists(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}

function listBlogSlugs() {
  try {
    return readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

function blogTitles() {
  const titles = [];
  for (const slug of listBlogSlugs()) {
    const fr = join(BLOG_DIR, slug, "fr.md");
    if (!fileExists(fr)) continue;
    const parsed = matter(readFileSync(fr, "utf8"));
    titles.push({
      slug,
      title: parsed.data.title ?? slug,
      description: parsed.data.description ?? "",
    });
  }
  return titles;
}

const formatDzd = (n) => n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
const formatRate = (dzd) => `${formatDzd(dzd)} DA (~${eurFrom(dzd)} €)`;

const TIER_KEYS = Object.keys(TIER_LABELS);
const rateRows = SEASON_DISPLAY_ORDER.map(
  (season) =>
    `| ${SEASON_LABELS[season]} | ${TIER_KEYS.map((tier) =>
      formatRate(SEASON_RATES_DZD[season][tier]),
    ).join(" | ")} |`,
).join("\n");

const capacities = [...new Set(allApartments.map((a) => a.capacity))].sort((a, b) => a - b);
const blog = blogTitles();
const generatedAt = new Date().toISOString().slice(0, 10);
const { street, locality, postalCode, region, country } = contactInfo.address;

const content = `# ${siteConfig.name}

> ${siteConfig.name} — résidence professionnelle de location courte durée en bord de mer à Filfila, wilaya de Skikda, Algérie. ${allApartments.length} appartements meublés (studios, F2, F2 avec jacuzzi et sauna, F3 avec terrasse privative). Proche des plages, des complexes touristiques Rusica Park et Marina d'Or.

Site trilingue : [français](${SITE}/fr/) (par défaut), [anglais](${SITE}/en/), [arabe](${SITE}/ar/). Chaque page existe aussi en markdown : ajoutez .md à son URL.

Capacités disponibles : ${capacities.join(", ")} personnes par appartement (+ jusqu'à ${EXTRA_PERSON_FEE.maxExtra} personnes supplémentaires avec supplément).

## Pages principales

- [Accueil](${SITE}/fr/) : présentation de la résidence, carte du site
- [Liste des appartements](${SITE}/fr/apartments/) : ${allApartments.length} logements meublés — filtres par type, étage et prix
- [Galerie photos](${SITE}/fr/gallery/) : images des appartements, extérieurs, plages
- [Blog](${SITE}/fr/blog/) : guides pratiques sur Skikda, réservation, tarifs, règles de vie
- [Règlement intérieur](${SITE}/fr/reglement/) : horaires, tabac, animaux, calme, documents requis
- [Contact](${SITE}/fr/contact/) : adresse, WhatsApp, Telegram, téléphone, plan d'accès

## Appartements individuels

${allApartments
  .map(
    (a) =>
      `- [${a.type} - ${a.slug}](${SITE}/fr/apartments/${a.slug}/) : ${a.size} m², ${a.capacity} personnes, à partir de ${a.priceeur} €/nuit (à partir de ${formatDzd(a.pricedz)} DA)`,
  )
  .join("\n")}

## Tarifs

Tarifs par nuit et par appartement, hors suppléments. Les prix « à partir de » cités ailleurs sur le site correspondent à la ligne « reste de l'année ». La conversion en euros est indicative.

| Période | ${TIER_KEYS.map((t) => TIER_LABELS[t]).join(" | ")} |
| --- | ${TIER_KEYS.map(() => "---").join(" | ")} |
${rateRows}

- Séjour de ${WEEKLY_DISCOUNT_MIN_NIGHTS} nuits ou plus : −${WEEKLY_DISCOUNT_PCT} %
- Personne supplémentaire au-delà de la capacité annoncée : ${formatDzd(EXTRA_PERSON_FEE.dzd)} DA (~${EXTRA_PERSON_FEE.eur} €) par nuit, ${EXTRA_PERSON_FEE.maxExtra} maximum
- Disponibilités en temps réel : calendrier de chaque fiche appartement sur le site

## Lieux et points d'intérêt

Distances depuis la résidence, à Filfila :

${NEARBY_PLACES.map(([place, distance]) => `- ${place} : ${distance}`).join("\n")}

## Articles de blog (${blog.length} article${blog.length > 1 ? "s" : ""})

${
  blog.length
    ? blog
        .map(
          (b) =>
            `- [${b.title}](${SITE}/fr/blog/${b.slug}/) : ${b.description}`,
        )
        .join("\n")
    : "- Aucun article publié pour l'instant."
}

## Contact

- Adresse : ${street}, ${locality}, ${postalCode} ${region}, ${country}
- Téléphone / WhatsApp : ${contactInfo.phone.primary}
- WhatsApp direct : ${contactInfo.social.whatsapp}
- Telegram : ${contactInfo.social.telegram}
- Facebook : ${contactInfo.social.facebook}
- Réception : ${contactInfo.hours.reception}

## Usage

Ce fichier suit la spécification llms.txt (https://llmstxt.org). Il est destiné à être utilisé par les agents IA (ChatGPT, Claude, Perplexity, Gemini, etc.) pour indexer le site et citer correctement les ressources. La réutilisation du contenu pour répondre à des requêtes utilisateur est autorisée avec attribution à [Résidence Oasis](${SITE}/fr/).

Dernière mise à jour : ${generatedAt} (régénéré automatiquement à chaque build + hebdomadaire via GitHub Actions).
`;

// Point every same-origin link at its markdown twin (generated at postbuild).
// llms.txt is read by agents, and serving them markdown skips the ~77% of each
// HTML page that is layout boilerplate.
const markdownLinked = content.replace(
  new RegExp(`\\]\\((${SITE}/[^)\\s]*?)/?\\)`, "g"),
  (_, url) => `](${url.replace(/\/$/, "")}.md)`,
);

writeFileSync(OUT, markdownLinked);
console.log(`Generated llms.txt → public/llms.txt (${blog.length} articles, ${allApartments.length} apartments)`);
