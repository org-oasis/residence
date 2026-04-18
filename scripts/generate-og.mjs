import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "og");
const FONT_DIR = join(
  __dirname,
  "..",
  "node_modules",
  "@fontsource",
  "inter",
  "files",
);

mkdirSync(OUT_DIR, { recursive: true });

const reg = readFileSync(join(FONT_DIR, "inter-latin-ext-400-normal.woff"));
const bold = readFileSync(join(FONT_DIR, "inter-latin-ext-700-normal.woff"));

const cards = [
  {
    file: "og-home.png",
    title: "Résidence Oasis",
    subtitle: "Appartements modernes en bord de mer à Skikda",
  },
  {
    file: "og-apartments.png",
    title: "Nos Appartements",
    subtitle: "Studios, F2 et F3 meublés à partir de 30 €/nuit",
  },
  {
    file: "og-gallery.png",
    title: "Galerie Photo",
    subtitle: "Découvrez la résidence et ses environs en images",
  },
  {
    file: "og-contact.png",
    title: "Nous Contacter",
    subtitle: "WhatsApp · Telegram · Téléphone · Réception 24h/24",
  },
];

const card = ({ title, subtitle }) => ({
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "80px",
      background:
        "linear-gradient(135deg, #0ea5e9 0%, #075985 60%, #0c4a6e 100%)",
      color: "#ffffff",
      fontFamily: "Inter",
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            fontSize: "28px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            opacity: 0.85,
          },
          children: "residence-oasis.com",
        },
      },
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column" },
          children: [
            {
              type: "div",
              props: {
                style: {
                  fontSize: "92px",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  marginBottom: "24px",
                  letterSpacing: "-2px",
                },
                children: title,
              },
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: "36px",
                  fontWeight: 400,
                  opacity: 0.95,
                  lineHeight: 1.3,
                  maxWidth: "900px",
                },
                children: subtitle,
              },
            },
          ],
        },
      },
    ],
  },
});

for (const c of cards) {
  const svg = await satori(card(c), {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: reg, weight: 400, style: "normal" },
      { name: "Inter", data: bold, weight: 700, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  writeFileSync(join(OUT_DIR, c.file), png);
  console.log(`✓ ${c.file}`);
}

console.log(`Generated ${cards.length} OG images → public/og/`);
