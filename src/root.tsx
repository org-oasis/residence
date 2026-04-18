import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dirFor, isLang, DEFAULT_LANG, type Lang } from "@/lib/i18n";
import "./index.css";

function langFromPath(pathname: string): Lang {
  const m = pathname.match(/^\/(fr|en|ar)(\/|$)/);
  return m && isLang(m[1]) ? (m[1] as Lang) : DEFAULT_LANG;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const dir = dirFor(lang);
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
        <link
          rel="preload"
          as="image"
          href="/assets/COMMON/00-background.avif"
          fetchPriority="high"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Outlet />
    </TooltipProvider>
  );
}
