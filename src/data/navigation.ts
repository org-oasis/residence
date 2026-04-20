// Top-menu navigation — single source of truth for:
//   - Navbar links (runtime React component)
//   - OG social-preview image generation (scripts/generate-og.mjs)
//
// Adding/removing an entry here updates both surfaces on the next build.
// The generator enforces that every top-menu page has a matching OG card;
// if you add a page without ogTitle/ogSubtitle, the script will throw.

import { TIERS } from "./pricing";

export interface TopMenuPage {
  /** Stable identifier used as filename (`og-<slug>.png`) and nav key. */
  slug: "home" | "apartments" | "reglement" | "contact";
  /** Path WITHOUT locale prefix. Empty string = site root. */
  path: string;
  /** Translation key on `t.nav.*` (used by Navbar to render the label). */
  navKey: "home" | "apartments" | "reglement" | "contact";
  /** Hero text on the OG card. */
  ogTitle: string;
  /** Sub-text on the OG card. */
  ogSubtitle: string;
}

export const TOP_MENU_PAGES: TopMenuPage[] = [
  {
    slug: "home",
    path: "/",
    navKey: "home",
    ogTitle: "Résidence Oasis",
    ogSubtitle: "Appartements modernes en bord de mer à Skikda",
  },
  {
    slug: "apartments",
    path: "/apartments",
    navKey: "apartments",
    ogTitle: "Nos Appartements",
    ogSubtitle: `Studios, F2 et F3 meublés à partir de ${TIERS.studio.eur} €/nuit`,
  },
  {
    slug: "reglement",
    path: "/reglement",
    navKey: "reglement",
    ogTitle: "Règlement intérieur",
    ogSubtitle: "Règles de vie et conditions de séjour",
  },
  {
    slug: "contact",
    path: "/contact",
    navKey: "contact",
    ogTitle: "Nous Contacter",
    ogSubtitle: "WhatsApp · Telegram · Téléphone · Réception 24h/24",
  },
];
