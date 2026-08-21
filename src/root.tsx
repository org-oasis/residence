import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { dictFor, dirFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import "./index.css";

/** Only the home route paints the hero background; every other page ignores it. */
const HOME_PATH = /^\/(fr|en|ar)\/?$/;

/** Anchor target of the skip link, assigned to the page's <main> on mount. */
const MAIN_CONTENT_ID = "main-content";

function langFromPath(pathname: string): Lang {
  const m = pathname.match(/^\/(fr|en|ar)(\/|$)/);
  return m && isLang(m[1]) ? (m[1] as Lang) : DEFAULT_LANG;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const dir = dirFor(lang);
  const t = dictFor(lang);

  // The skip link lives here so it is the first focusable element of every page,
  // but its target <main> is rendered by each route. Tagging it from the layout
  // keeps the anchor working without duplicating the id in all ten page files.
  // tabIndex=-1 is what actually moves focus (not just the scroll position) into
  // <main> on browsers that ignore the sequential focus navigation starting point.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || main.id) return;
    main.id = MAIN_CONTENT_ID;
    main.tabIndex = -1;
  }, [pathname]);

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta name="author" content="Résidence Oasis" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          href="/assets/logo-only-without-bg.avif"
        />
        <link
          rel="icon"
          href="/assets/logo-only-without-bg.avif"
          type="image/avif"
        />
        {/* Scoped to the home route: emitted from the shared head it cost every
            prerendered page — including the 186 articles — a useless image fetch. */}
        {HOME_PATH.test(pathname) && (
          <link
            rel="preload"
            as="image"
            href="/assets/COMMON/00-background.avif"
            fetchPriority="high"
          />
        )}
        <Meta />
        <Links />
      </head>
      <body>
        {/* Parked off-screen rather than hidden so screen readers still announce it;
            start-* keeps it on the correct side once the document flips to RTL. */}
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="fixed top-3 start-[-100vw] z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-foreground shadow-lg focus:start-3"
        >
          {t.a11y.skipToContent}
        </a>
        {/* Agent-facing pointer to the machine-readable index. Clipped rather
            than display:none so crawlers that respect visibility still read it;
            aria-hidden + no tab stop keep it out of the human experience. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            whiteSpace: "nowrap",
          }}
        >
          This page is available as markdown at the same URL with{" "}
          <code>.md</code> appended. Full index:{" "}
          <a href="/llms.txt" tabIndex={-1}>
            llms.txt
          </a>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      {/* No TooltipProvider here: `Tooltip` provides its own, so the 17 KB
          Radix bundle stays out of the 186 blog pages that never show one. */}
      <Outlet />
    </ErrorBoundary>
  );
}
