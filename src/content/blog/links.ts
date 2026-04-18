// Trilingual internal-link library used by the redaction + translation prompts.
// Authors should pull anchors from this module so anchor text matches the locale
// and URLs always use the correct lang prefix.

import type { Lang } from "@/lib/i18n";

export interface InternalLink {
  /** Path WITHOUT locale prefix, e.g. "/apartments". Empty string = home. */
  path: string;
  /** Natural anchor variants per locale; pick the one that fits the sentence. */
  anchors: Record<Lang, string[]>;
}

export const INTERNAL_LINKS: InternalLink[] = [
  {
    path: "/apartments",
    anchors: {
      fr: [
        "nos appartements en bord de mer",
        "studios et F2/F3 disponibles",
        "tous les hébergements de la résidence",
      ],
      en: [
        "our beachfront apartments",
        "available studios and F2/F3 units",
        "all residence accommodations",
      ],
      ar: [
        "شققنا على البحر",
        "الستوديوهات وشقق F2/F3 المتاحة",
        "جميع الإقامات في الإقامة",
      ],
    },
  },
  {
    path: "/apartments/studio-deluxe-1",
    anchors: {
      fr: ["le studio deluxe au rez-de-chaussée", "studio meublé pour deux"],
      en: ["the ground-floor deluxe studio", "furnished studio for two"],
      ar: ["ستوديو ديلوكس في الطابق الأرضي", "ستوديو مفروش لشخصين"],
    },
  },
  {
    path: "/apartments/f2-classique-2",
    anchors: {
      fr: ["F2 classique idéal pour une famille", "appartement deux pièces étage 1"],
      en: ["F2 family-friendly apartment", "two-room apartment on the first floor"],
      ar: ["شقة F2 العائلية الكلاسيكية", "شقة غرفتين في الطابق الأول"],
    },
  },
  {
    path: "/apartments/f2-jacuzzi-3",
    anchors: {
      fr: ["F2 avec jacuzzi privatif", "appartement avec jacuzzi premium"],
      en: ["F2 with private jacuzzi", "apartment with a premium jacuzzi"],
      ar: ["شقة F2 مع جاكوزي خاص", "شقة بجاكوزي فاخر"],
    },
  },
  {
    path: "/apartments/f2-moderne-4",
    anchors: {
      fr: ["F2 moderne au deuxième étage"],
      en: ["modern F2 on the second floor"],
      ar: ["شقة F2 حديثة في الطابق الثاني"],
    },
  },
  {
    path: "/apartments/f2-moderne-5",
    anchors: {
      fr: ["F2 lumineux deuxième étage"],
      en: ["bright second-floor F2"],
      ar: ["شقة F2 مشرقة في الطابق الثاني"],
    },
  },
  {
    path: "/apartments/f2-deluxe-6",
    anchors: {
      fr: ["F2 deluxe avec finitions premium"],
      en: ["deluxe F2 with premium finishes"],
      ar: ["شقة F2 ديلوكس بتشطيبات فاخرة"],
    },
  },
  {
    path: "/apartments/f3-terrasse-7",
    anchors: {
      fr: ["F3 avec terrasse privative", "appartement trois pièces avec terrasse"],
      en: ["F3 with private terrace", "three-room apartment with terrace"],
      ar: ["شقة F3 مع تراس خاص", "شقة ثلاث غرف مع تراس"],
    },
  },
  {
    path: "/gallery",
    anchors: {
      fr: ["galerie photos de la résidence", "voir les images des appartements"],
      en: ["residence photo gallery", "view apartment images"],
      ar: ["معرض صور الإقامة", "اطّلع على صور الشقق"],
    },
  },
  {
    path: "/contact",
    anchors: {
      fr: ["page contact et plan d'accès", "WhatsApp, Telegram et téléphone"],
      en: ["contact page and directions", "WhatsApp, Telegram and phone"],
      ar: ["صفحة الاتصال والوصول", "واتساب وتيليجرام والهاتف"],
    },
  },
  {
    path: "/blog",
    anchors: {
      fr: ["d'autres conseils sur le blog"],
      en: ["more tips on the blog"],
      ar: ["مزيد من النصائح على المدونة"],
    },
  },
];

/** Build a localized href for an internal link path. */
export function localizedLink(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${lang}`;
  return `/${lang}${clean}`;
}
