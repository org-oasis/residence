// Generates public/llms.txt from the current site + blog content.
// Runs at prebuild. Output is git-ignored.
// Re-runs weekly via GitHub Actions cron so new blog articles appear automatically.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { allApartments, contactInfo, siteConfig } from "../src/data/appData.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const OUT = join(ROOT, "public", "llms.txt");
const SITE = "https://residence-oasis.com";

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

const blog = blogTitles();
const generatedAt = new Date().toISOString().slice(0, 10);

const content = `# ${siteConfig.name}

> ${siteConfig.name} — résidence professionnelle de location courte durée en bord de mer à Filfila, wilaya de Skikda, Algérie. ${allApartments.length} appartements meublés (studios, F2, F2 avec jacuzzi et sauna, F3 avec terrasse privative). Proche des plages, des complexes touristiques Rusica Park et Marina d'Or.

Site trilingue : français (par défaut), anglais, arabe. URL canoniques : ${SITE}/fr/, ${SITE}/en/, ${SITE}/ar/.

Capacités disponibles : 2, 4 ou 6 personnes par appartement (+ jusqu'à 2 personnes supplémentaires avec supplément).

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
      `- [${a.type} - ${a.slug}](${SITE}/fr/apartments/${a.slug}/) : ${a.size} m², ${a.capacity} personnes, ${a.priceeur} €/nuit (${a.pricedz.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} DA)`,
  )
  .join("\n")}

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

- Adresse : ${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.country}
- Téléphone / WhatsApp : ${contactInfo.phone.primary}
- Téléphone / WhatsApp (alt) : ${contactInfo.phone.secondary}
- WhatsApp direct : ${contactInfo.social.whatsapp}
- Telegram : ${contactInfo.social.telegram}
- Facebook : ${contactInfo.social.facebook}

## Usage

Ce fichier suit la spécification llms.txt (https://llmstxt.org). Il est destiné à être utilisé par les agents IA (ChatGPT, Claude, Perplexity, Gemini, etc.) pour indexer le site et citer correctement les ressources. La réutilisation du contenu pour répondre à des requêtes utilisateur est autorisée avec attribution au site ${SITE}.

Dernière mise à jour : ${generatedAt} (régénéré automatiquement à chaque build + hebdomadaire via GitHub Actions).
`;

writeFileSync(OUT, content);
console.log(`Generated llms.txt → public/llms.txt (${blog.length} articles, ${allApartments.length} apartments)`);
