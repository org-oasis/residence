/**
 * Content negotiation for residence-oasis.com.
 *
 * The site is static on GitHub Pages, which serves one representation per URL
 * and cannot vary on a request header. Cloudflare already proxies the domain,
 * so the negotiation happens here instead.
 *
 * Two jobs:
 *   1. A request for /fr/blog/x/ carrying `Accept: text/markdown` is served the
 *      already-built /fr/blog/x.md twin.
 *   2. Any .md response gets `content-type: text/markdown`, because the origin
 *      labels them text/plain.
 *
 * Deploy:
 *   wrangler deploy                       (see wrangler.toml next to this file)
 *   Route: residence-oasis.com/*          zone: residence-oasis.com
 *
 * If this Worker is removed the site keeps working: agents fall back to the
 * .md URLs, which are plain static files and need no edge logic.
 */

const MARKDOWN_TYPE = "text/markdown; charset=utf-8";

/** The .md twin the build emits for a page URL. "/a/b/" -> "/a/b.md" */
function markdownPathFor(pathname) {
  if (pathname.endsWith(".md")) return null;
  const trimmed = pathname.replace(/\/+$/, "");
  return `${trimmed || "/index"}.md`;
}

function wantsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  if (!accept.includes("text/markdown")) return false;
  // An `Accept: */*` client that merely lists markdown among many types is not
  // asking for it; only honour it when markdown outranks html.
  const html = accept.indexOf("text/html");
  const md = accept.indexOf("text/markdown");
  return html === -1 || md < html;
}

/** Always advertise that the response varies, so caches stay correct. */
function withVary(response, contentType) {
  const headers = new Headers(response.headers);
  headers.set("Vary", "Accept");
  if (contentType) headers.set("content-type", contentType);
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return fetch(request);
    }

    if (url.pathname.endsWith(".md")) {
      return withVary(await fetch(request), MARKDOWN_TYPE);
    }

    if (wantsMarkdown(request)) {
      const target = markdownPathFor(url.pathname);
      if (target) {
        const twin = new URL(url);
        twin.pathname = target;
        const response = await fetch(new Request(twin, request));
        if (response.ok) return withVary(response, MARKDOWN_TYPE);
      }
    }

    return withVary(await fetch(request));
  },
};
