// Emits a .md twin of every prerendered page, so agents that ask for markdown
// get the content instead of 52 KB of HTML boilerplate (~77% of each page).
//
// Runs at postbuild against build/client, not against the sources: the HTML has
// already had its price tokens resolved and its data interpolated, so there is
// exactly one place where page content is defined.
//
// Two files per page — "/a/b.md" and "/a/b/index.md" — because agents probe both
// shapes when appending .md to a trailing-slash URL. Output is git-ignored.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BUILD = join(ROOT, "build", "client");
const SITE = "https://residence-oasis.com";
const DIRECTIVE = `> For the complete documentation index, see [llms.txt](${SITE}/llms.txt). Every page on this site is also available as markdown by appending \`.md\` to its URL.`;

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " ",
  eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô",
  ugrave: "ù", icirc: "î", acirc: "â", euml: "ë", iuml: "ï", ndash: "–", mdash: "—",
  laquo: "«", raquo: "»", hellip: "…", euro: "€", deg: "°", times: "×", rsquo: "’",
};

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-zA-Z#0-9]+);/g, (m, name) => ENTITIES[name] ?? m);

/** Collapse runs of whitespace but keep the string's leading/trailing intent. */
const tidy = (s) => decode(s).replace(/\s+/g, " ").trim();

/** Strip every tag from a fragment, used for cells and headings. */
const plain = (html) => tidy(html.replace(/<[^>]+>/g, ""));

/**
 * Inline tags to markdown. Links are absolutised and pointed at the .md twin so
 * an agent following them keeps getting markdown rather than falling back to HTML.
 */
function inline(html) {
  let out = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${plain(t)}**`)
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${plain(t)}*`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${plain(t)}\``)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
      const label = plain(t);
      if (!label) return "";
      let target = href;
      if (target.startsWith("/")) target = `${SITE}${target}`;
      if (target.startsWith(SITE)) target = `${target.replace(/\/$/, "")}.md`;
      return `[${label}](${target})`;
    });
  // Anything still tagged is layout we have no markdown equivalent for (svg
  // icons, wrappers). Drop the tags but keep whatever text they wrapped.
  out = out.replace(/<[^>]+>/g, " ");
  return tidy(out);
}

function tableToMarkdown(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) => inline(c[2])),
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => [...r, ...Array(width - r.length).fill("")];
  const [head, ...body] = rows;
  return [
    `| ${pad(head).join(" | ")} |`,
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...body.map((r) => `| ${pad(r).join(" | ")} |`),
  ].join("\n");
}

/** Block-level walk over the page's <main>, in document order. */
function htmlToMarkdown(main) {
  const blocks = [];
  const pattern =
    /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>|<table[^>]*>[\s\S]*?<\/table>|<(ul|ol)[^>]*>[\s\S]*?<\/\3>|<p[^>]*>([\s\S]*?)<\/p>|<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;

  for (const m of main.matchAll(pattern)) {
    const chunk = m[0];
    if (m[1]) {
      const text = inline(m[2]);
      if (text) blocks.push(`${"#".repeat(Number(m[1]))} ${text}`);
    } else if (/^<table/i.test(chunk)) {
      const table = tableToMarkdown(chunk);
      if (table) blocks.push(table);
    } else if (m[3]) {
      const ordered = m[3].toLowerCase() === "ol";
      const items = [...chunk.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li, i) => {
          const text = inline(li[1]);
          return text ? `${ordered ? `${i + 1}.` : "-"} ${text}` : "";
        })
        .filter(Boolean);
      if (items.length) blocks.push(items.join("\n"));
    } else if (m[4] !== undefined) {
      const text = inline(m[4]);
      if (text) blocks.push(text);
    } else if (m[5] !== undefined) {
      const text = inline(m[5]);
      if (text) blocks.push(`> ${text}`);
    }
  }
  return blocks;
}

function metaOf(html, key, attr = "name") {
  const re = new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`, "i");
  const alt = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`, "i");
  const m = html.match(re) ?? html.match(alt);
  return m ? decode(m[1]) : "";
}

function pageToMarkdown(html, urlPath) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const blocks = htmlToMarkdown(main);

  const title =
    plain(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") ||
    decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").split("|")[0].trim();
  const description = metaOf(html, "description");

  // Drop the leading h1 from the body; it becomes the document title instead.
  if (blocks[0]?.startsWith("# ")) blocks.shift();

  // Page chrome (back link, category tag, hero h1 and standfirst) sits in one
  // wrapper, so it collapses into a single paragraph that restates the title.
  // The title and description are already in the head block above.
  const restatesTitle = (b) =>
    !b.startsWith("#") && !b.startsWith("|") && title.length > 20 && b.includes(title);
  while (blocks.length && restatesTitle(blocks[0])) blocks.shift();

  const head = [`# ${title}`, DIRECTIVE];
  if (description) head.push(`*${description}*`);
  head.push(`Canonical HTML version: ${SITE}${urlPath}`);

  return `${[...head, ...blocks].join("\n\n")}\n`;
}

function walk(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, found);
    else if (entry === "index.html") found.push(full);
  }
  return found;
}

const pages = walk(BUILD);
let written = 0;
let thin = 0;

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const dir = dirname(file);
  const urlPath = `/${relative(BUILD, dir).split(/[\\/]/).filter(Boolean).join("/")}${
    relative(BUILD, dir) ? "/" : ""
  }`;
  const md = pageToMarkdown(html, urlPath);

  // A page whose <main> yielded almost nothing means the extractor missed the
  // markup. Surface it rather than shipping an empty markdown twin.
  if (md.length < 200) thin += 1;

  writeFileSync(join(dir, "index.md"), md);
  written += 1;

  // Sibling form: /fr/blog/plage-stora.md next to /fr/blog/plage-stora/.
  if (relative(BUILD, dir)) {
    const sibling = `${dir}.md`;
    mkdirSync(dirname(sibling), { recursive: true });
    writeFileSync(sibling, md);
    written += 1;
  }
}

if (thin > 0) {
  console.warn(`  warning: ${thin} page(s) produced under 200 chars of markdown`);
}
console.log(`Generated ${written} markdown twins for ${pages.length} pages → build/client/`);
