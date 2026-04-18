import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, DEFAULT_LANG } from "@/lib/i18n";

export const meta: MetaFunction = () => [
  { title: "Résidence Oasis" },
  {
    name: "description",
    content: "Résidence Oasis - Appartements modernes en bord de mer à Skikda",
  },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/${DEFAULT_LANG}` },
  ...LOCALES.map((l) => ({
    tagName: "link" as const,
    rel: "alternate",
    hrefLang: l,
    href: `${SITE_URL}/${l}`,
  })),
  {
    tagName: "link",
    rel: "alternate",
    hrefLang: "x-default",
    href: `${SITE_URL}/${DEFAULT_LANG}`,
  },
  { httpEquiv: "refresh", content: `0; url=/${DEFAULT_LANG}` },
];

export default function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("language") : null;
    const target =
      stored && (LOCALES as readonly string[]).includes(stored)
        ? stored
        : DEFAULT_LANG;
    navigate(`/${target}`, { replace: true });
  }, [navigate]);
  return null;
}
