# Résidence Oasis

Beachfront-apartment rental site for Résidence Oasis (Filfila, Skikda, Algérie). Static-rendered multilingual (fr / en / ar) SPA with per-apartment landing pages, full SEO (meta, OG, JSON-LD, hreflang, sitemap), and built-in prerendering.

Live: https://residence-oasis.com

## Stack

- **Bun** — package manager + runtime. `bun.lockb` is the source of truth. **Do not use `npm install`.**
- **Vite 7** + **React 19** + **TypeScript 5**
- **React Router 7** (framework mode, `ssr: false` + full-route prerender)
- **Tailwind CSS 4** (CSS-first config via `@theme`, no `tailwind.config.ts`)
- **shadcn/ui** (Radix primitives)
- **Supabase** (availability calendar data)
- **Satori + @resvg/resvg-js** — OG image generation at build time

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3 (`curl -fsSL https://bun.sh/install | bash`)
- Node.js ≥ 20 (for the Satori OG script)

> **Why not npm/pnpm/yarn?** The repo only ships `bun.lockb`. Running `npm i` or `yarn` will fail with peer-dependency conflicts (e.g. `ERESOLVE` on `react-router`) because they regenerate their own lockfile against the loose `^` ranges and pick up stale transitive versions. If you *must* use npm, delete `package-lock.json` first and pass `--legacy-peer-deps`, but the supported path is Bun.

## Environment

Copy `.env.example` → `.env` and fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Without these, the availability calendar on apartment detail pages stays disabled but the rest of the site works.

## Commands

| Command | What it does |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start the React Router dev server at `http://localhost:5173` |
| `bun run build` | Generate OG images (prebuild) → prerender every route to static HTML under `build/client/` |
| `bun run og` | Regenerate OG social-preview PNGs only |
| `bun run blog:gen` | Regenerate `src/lib/blog-data.generated.ts` + `src/lib/blog-content/` from `src/content/blog/` (both gitignored) |
| `bun run images:gen` | Regenerate the responsive image variants |
| `bun run typecheck` | `tsc --noEmit` on the app project |
| `bun run lint` | ESLint on `src/**/*.{ts,tsx}` |
| `bun test` | Bun test suites under `tests/` (calendar, pricing, SEO/JSON-LD, blog facts) |
| `bun run check` | Typecheck + lint + tests in one go — same gate the CI runs before deploying |
| `bun run preview` | Serve the built `build/client/` with `vite preview` |

`bun run check` regenerates the blog data first (via its `precheck` hook), so it works
from a clean checkout. Run it before pushing: the deploy workflow runs the same three
steps and refuses to publish if any of them fails.

## Invariants

Two rules keep the static build honest — break either and the site ships wrong pages:

- **Every new route must be added to the prerender list in `react-router.config.ts`.**
  The app is `ssr: false` + full prerender on GitHub Pages: a route missing from
  `prerender()` produces no HTML file and 404s in production, even though it works
  in `bun run dev`.
- **`src/data/pricing.ts` is the single source of truth for prices and capacities.**
  Apartment cards, detail pages, the price filter bounds, the JSON-LD offers and the
  generated blog price tables all derive from it. Never hardcode a rate elsewhere;
  edit the grid there and rerun `bun run blog:gen`.

## Routes

All content lives under a locale prefix. `/` redirects to `/fr`.

- `/fr`, `/en`, `/ar`
- `/{lang}/apartments`
- `/{lang}/apartments/{slug}` — 7 units (see `src/data/appData.ts`)
- `/{lang}/gallery`
- `/{lang}/contact`

Build produces 34 static HTML files (1 root redirect + 3 locales × 11 pages) plus `sitemap.xml` (33 unique URLs) and `robots.txt`.

## Project structure

```
src/
├── root.tsx              # RR7 document shell (<html>, <head>, <Meta/>, <Scripts/>)
├── routes.ts             # RR7 RouteConfig (nested under :lang)
├── routes/
│   ├── lang-layout.tsx   # Validates :lang param, renders <Outlet/>
│   └── root-redirect.tsx # / → /fr (meta-refresh + JS fallback)
├── pages/                # Index, Apartments, ApartmentDetail, Gallery, Contact, NotFound
├── components/           # Navbar, Footer, HeroSection, ApartmentCard, ui/* (shadcn)
├── contexts/
│   └── LanguageContext.tsx # URL-driven hook (reads :lang param, no Provider state)
├── lib/
│   ├── i18n.ts           # LOCALES, useLang, useLocalizedHref, useSwitchLanguage
│   ├── seo.ts            # buildMeta() → title, description, canonical, OG, Twitter, hreflang
│   └── jsonld.ts         # LodgingBusiness, Apartment+Offer, BreadcrumbList, FAQPage builders
├── locales/              # fr.ts, en.ts, ar.ts
├── data/appData.ts       # Apartments, contact info, site config
└── index.css             # Tailwind 4 @import + @theme + @plugin directives

react-router.config.ts    # ssr: false, prerender: all locale × route combos
vite.config.ts            # reactRouter() + tailwindcss() + Sitemap() plugins
scripts/generate-og.mjs   # Satori → 1200×630 PNG OG cards (runs on prebuild)
```

## SEO

Every prerendered page emits:

- Unique `<title>` and `<meta name="description">` (per locale, per page)
- `<link rel="canonical">`
- `<link rel="alternate" hrefLang>` × 4 (fr, en, ar, x-default)
- Full Open Graph + Twitter Card set
- JSON-LD: `LodgingBusiness` on home, `BreadcrumbList` on interior, `FAQPage` on `/contact`, `Apartment` + two `Offer` nodes (EUR + DZD) on each apartment detail

Sitemap is generated by `vite-plugin-sitemap` at `build/client/sitemap.xml`.

## Deployment

Deploy `build/client/` as a static site. `_redirects` and `_headers` are included for Netlify / Cloudflare Pages. For true 404 status on unknown paths, configure the host — the SPA fallback currently returns 200.

## License

Private — © Résidence Oasis.
