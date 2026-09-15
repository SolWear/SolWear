import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { findItem, href, type RenderedDoc, type TocEntry } from "@/lib/docs";

const DOCS_DIR = path.join(process.cwd(), "src", "content", "docs");

marked.setOptions({ gfm: true, breaks: false });

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Read a doc's markdown, render it to HTML, and collect a table of contents. */
export function getDoc(slug: string, cleanRoot = false): RenderedDoc | null {
  const item = findItem(slug);
  if (!item) return null;

  const file = path.join(DOCS_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }

  // Give headings stable, unique ids and collect a table of contents.
  // marked v12 renderer signature: heading(text, level, raw).
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();
  const renderer = new marked.Renderer();
  renderer.heading = (text: string, level: number, raw2: string) => {
    let id = slugifyHeading(raw2) || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;
    if (level === 2 || level === 3) toc.push({ id, text: raw2.replace(/`/g, ""), level });
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  renderer.link = (linkHref: string, title: string | null | undefined, text: string) => {
    let target = linkHref;
    if (!/^(?:[a-z]+:|\/|#)/i.test(linkHref)) {
      const rawTarget = linkHref.split(/[?#]/, 1)[0];
      const filename = path.posix.basename(rawTarget).replace(/\.(?:md|html)$/i, "");
      const aliases: Record<string, string> = {
        ARCHITECTURE: "architecture",
        LEGACY_MIGRATION: "legacy-migration",
      };
      const docSlug = aliases[filename] ?? filename.toLowerCase();
      if (findItem(docSlug)) target = href(docSlug, cleanRoot);
    }
    const titleAttr = title ? ` title="${title.replace(/"/g, "&quot;")}"` : "";
    return `<a href="${target}"${titleAttr}>${text}</a>`;
  };

  const html = marked.parse(raw, { renderer, async: false }) as string;
  return { title: item.title, slug, html, toc };
}
