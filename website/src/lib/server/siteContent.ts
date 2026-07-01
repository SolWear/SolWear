import { defaultSiteContent, type SiteContent, type SponsorLogo } from "@/lib/siteContent";
import { db } from "./db";

const SITE_CONTENT_KEY = "landing";

function dynamicStorageEnabled(): boolean {
  return process.env.SOLWEAR_STATIC_EXPORT !== "1" && process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";
}

function parseContent(value: string): SiteContent {
  const parsed = JSON.parse(value) as SiteContent;
  return {
    ...defaultSiteContent,
    ...parsed,
    hero: { ...defaultSiteContent.hero, ...parsed.hero },
    sections: { ...defaultSiteContent.sections, ...parsed.sections },
    links: { ...defaultSiteContent.links, ...parsed.links },
  };
}

export function getSiteContent(): SiteContent {
  if (!dynamicStorageEnabled()) return defaultSiteContent;

  try {
    const row = db()
      .prepare("SELECT value FROM site_content WHERE key = ?")
      .get(SITE_CONTENT_KEY) as { value: string } | undefined;
    if (!row?.value) return defaultSiteContent;
    return parseContent(row.value);
  } catch (error) {
    console.error("[site-content] falling back to defaults:", error);
    return defaultSiteContent;
  }
}

export function saveSiteContent(content: SiteContent): void {
  db()
    .prepare(
      `INSERT INTO site_content (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    )
    .run(SITE_CONTENT_KEY, JSON.stringify(content), new Date().toISOString());
}

export function getSponsorLogos(): SponsorLogo[] {
  if (!dynamicStorageEnabled()) return [];

  const rows = db()
    .prepare(
      `SELECT id, name, logo_url, href, invert, brightness, sort_order
       FROM sponsor_logos
       ORDER BY sort_order ASC, id ASC`,
    )
    .all() as Array<Omit<SponsorLogo, "invert"> & { invert: 0 | 1 }>;

  return rows.map((sponsor) => ({ ...sponsor, invert: Boolean(sponsor.invert) }));
}

export function upsertSponsorLogo(input: {
  id?: number;
  name: string;
  logo_url: string;
  href?: string | null;
  invert?: boolean;
  brightness?: number;
  sort_order?: number;
}): SponsorLogo {
  const now = new Date().toISOString();
  const name = input.name.trim().slice(0, 80);
  const logoUrl = input.logo_url.trim().slice(0, 500);
  const href = input.href?.trim() ? input.href.trim().slice(0, 500) : null;
  const invert = input.invert === false ? 0 : 1;
  const brightness = Number.isFinite(input.brightness) ? Math.min(1.5, Math.max(0.3, input.brightness!)) : 0.9;
  const sortOrder = Number.isFinite(input.sort_order) ? Math.trunc(input.sort_order!) : 0;

  if (!name || !logoUrl) {
    throw new Error("Sponsor name and logo URL are required");
  }

  let id = input.id;
  if (id) {
    db()
      .prepare(
        `UPDATE sponsor_logos
         SET name = ?, logo_url = ?, href = ?, invert = ?, brightness = ?, sort_order = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(name, logoUrl, href, invert, brightness, sortOrder, now, id);
  } else {
    const result = db()
      .prepare(
        `INSERT INTO sponsor_logos
         (name, logo_url, href, invert, brightness, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(name, logoUrl, href, invert, brightness, sortOrder, now, now);
    id = Number(result.lastInsertRowid);
  }

  const row = db()
    .prepare("SELECT id, name, logo_url, href, invert, brightness, sort_order FROM sponsor_logos WHERE id = ?")
    .get(id) as (Omit<SponsorLogo, "invert"> & { invert: 0 | 1 }) | undefined;
  if (!row) throw new Error("Sponsor was not saved");
  return { ...row, invert: Boolean(row.invert) };
}

export function deleteSponsorLogo(id: number): boolean {
  return db().prepare("DELETE FROM sponsor_logos WHERE id = ?").run(id).changes > 0;
}
