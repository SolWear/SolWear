/**
 * SolWear OS documentation, brought into the product site.
 *
 * This module is client-safe: it holds only the nav structure and slug helpers,
 * with no Node built-ins, so it can be imported by the client-side sidebar.
 * Markdown reading/rendering lives in docs.server.ts (server-only).
 *
 * The markdown lives at src/content/docs/<slug>.md — copied verbatim from the
 * SolWear_OS repo (docs/pages/*.md, docs/ARCHITECTURE.md, docs/LEGACY_MIGRATION.md).
 * The nav groups and order mirror that repo's docs/site.json.
 */

export type DocItem = { title: string; slug: string };
export type DocGroup = { title: string; items: DocItem[] };

/** The Overview page is served at /docs; every other page at /docs/<slug>. */
export const OVERVIEW_SLUG = "index";

// Groups / order taken directly from SolWear_OS docs/site.json.
export const DOC_NAV: DocGroup[] = [
  {
    title: "Start here",
    items: [
      { title: "Overview", slug: "index" },
      { title: "Getting Started", slug: "getting-started" },
      { title: "Installing the SDK", slug: "installing-the-sdk" },
      { title: "Your First Watchface", slug: "your-first-watchface" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "App Manifest Reference", slug: "app-manifest-reference" },
      { title: "Package Format and Signing", slug: "package-format-and-signing" },
      { title: "JSON-RPC API Reference", slug: "json-rpc-api-reference" },
      { title: "Capabilities and Security", slug: "capabilities-and-security" },
      { title: "Architecture Specification", slug: "architecture" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Using the Emulator", slug: "using-the-emulator" },
      { title: "Working with the Wallet", slug: "working-with-the-wallet" },
      { title: "ESP32 Migration Status", slug: "legacy-migration" },
      { title: "Publishing to the Store", slug: "publishing-to-the-store" },
      { title: "Flashing a Raspberry Pi", slug: "flashing-a-raspberry-pi" },
    ],
  },
];

const FLAT_ITEMS: DocItem[] = DOC_NAV.flatMap((g) => g.items);

export function href(slug: string, cleanRoot = false): string {
  if (cleanRoot) return slug === OVERVIEW_SLUG ? "/" : `/${slug}/`;
  return slug === OVERVIEW_SLUG ? "/docs/" : `/docs/${slug}/`;
}

export function allSlugs(): string[] {
  return FLAT_ITEMS.map((i) => i.slug);
}

/** Non-overview slugs — the params for /docs/[slug]. */
export function pageSlugs(): string[] {
  return FLAT_ITEMS.filter((i) => i.slug !== OVERVIEW_SLUG).map((i) => i.slug);
}

export function findItem(slug: string): DocItem | undefined {
  return FLAT_ITEMS.find((i) => i.slug === slug);
}

/** The nav group a page belongs to (e.g. "Reference"), for the breadcrumb. */
export function groupTitle(slug: string): string | undefined {
  return DOC_NAV.find((g) => g.items.some((i) => i.slug === slug))?.title;
}

/** Previous / next in reading order, for the footer pager. */
export function neighbors(slug: string): { prev?: DocItem; next?: DocItem } {
  const i = FLAT_ITEMS.findIndex((it) => it.slug === slug);
  if (i === -1) return {};
  return { prev: FLAT_ITEMS[i - 1], next: FLAT_ITEMS[i + 1] };
}

export type TocEntry = { id: string; text: string; level: number };
export type RenderedDoc = { title: string; slug: string; html: string; toc: TocEntry[] };
