import { TIERS, type TierKey } from "@/data/pricing";
import { contactInfo } from "@/data/appData";

export interface HomeFaqItem {
  question: string;
  answer: string;
}

/**
 * Thousands separator applied by hand rather than via `toLocaleString`: the page
 * is prerendered in Bun and hydrated in the browser, and the two ICU builds do
 * not always pick the same separator character for fr-FR.
 */
function dzd(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** "18 €/nuit (4 500 DA)" — year-round base rate of a tier, never a peak rate. */
function fromRate(tier: TierKey): string {
  return `${TIERS[tier].eur} €/nuit (${dzd(TIERS[tier].dzd)} DA)`;
}

const telegramHandle = contactInfo.social.telegram.split("/").pop() ?? "";

/**
 * FAQ shown on the bot-facing root page and published as JSON-LD `FAQPage`.
 * Prices and capacities come from pricing.ts so an answer can never drift away
 * from what the apartment pages quote.
 */
export const HOME_FAQ: HomeFaqItem[] = [
  {
    question: "Où se trouve la Résidence Oasis exactement ?",
    answer:
      "La résidence est située à Filfila, à 20 km à l'est de Skikda et à 100 km de Constantine. Plage Jeanne d'Arc à 700 m, complexes touristiques Rusica Park et Royal Tulip à proximité immédiate.",
  },
  {
    question: "Quels types d'appartements proposez-vous à Filfila ?",
    answer: `Sept appartements meublés : un studio (${TIERS.studio.capacity} pers.), quatre F2 modernes (${TIERS.f2.capacity} pers.), un F2 avec jacuzzi privatif et sauna (${TIERS.f2jacuzzi.capacity} pers.), et un F3 de 132 m² avec terrasse privée (${TIERS.f3.capacity} pers.). Tous équipés cuisine, climatisation neuve, Wi-Fi fibre 240 Mbps.`,
  },
  {
    question: "Comment réserver depuis l'étranger ?",
    answer: `Réservation directe par WhatsApp (${contactInfo.phone.primary}) ou Telegram (@${telegramHandle}). Acompte d'une nuit par virement CCP dans les 24 h, solde à l'arrivée en dinars algériens (DA) ou en euros (€). Aucune caution, aucun frais caché.`,
  },
  {
    question: "Quels sont les tarifs ?",
    answer: `Les tarifs démarrent à ${fromRate("studio")} pour le studio et ${fromRate("f2")} pour un F2 moderne. Le F2 avec jacuzzi et sauna démarre à ${fromRate("f2jacuzzi")}, le F3 avec terrasse privée à ${fromRate("f3")}. Ces montants sont les tarifs de base valables hors haute saison ; juillet-août constitue le palier le plus élevé de la grille saisonnière.`,
  },
  {
    question: "Y a-t-il un appartement avec jacuzzi à Skikda ?",
    answer: `Oui, l'appartement F2 Jacuzzi & Sauna (44 m², ${TIERS.f2jacuzzi.capacity} personnes) propose un jacuzzi privatif et un sauna intégrés à l'appartement. Disponible à Filfila à 700 m de la plage Jeanne d'Arc.`,
  },
  {
    question: "Le Wi-Fi est-il rapide pour le télétravail ?",
    answer:
      "Oui, fibre optique 240 Mbps avec un modem dédié par étage pour répartir la charge. Adapté à Zoom, Google Meet, streaming 4K et appels vidéo simultanés.",
  },
];
