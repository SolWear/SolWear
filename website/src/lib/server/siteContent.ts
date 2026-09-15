import { defaultSiteContent, type SiteContent, type SponsorLogo } from "@/lib/siteContent";
import { db } from "./db";

const SITE_CONTENT_KEY = "content_v2";

/** Deep-merges stored content over defaults so new fields never render blank. */
function merge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (typeof base !== "object") return (typeof override === typeof base ? override : base) as T;

  const out = { ...(base as object) } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (key in out) out[key] = merge((base as Record<string, unknown>)[key], value);
  }
  return out as T;
}

export function getSiteContent(): SiteContent {
  try {
    const row = db().prepare("SELECT value FROM site_content WHERE key = ?").get(SITE_CONTENT_KEY) as
      | { value: string }
      | undefined;
    if (!row?.value) return defaultSiteContent;
    return merge(defaultSiteContent, JSON.parse(row.value));
  } catch (error) {
    console.error("[site-content] falling back to defaults:", error);
    return defaultSiteContent;
  }
}

export function saveSiteContent(content: SiteContent): SiteContent {
  const merged = merge(defaultSiteContent, content);
  db()
    .prepare(
      `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(SITE_CONTENT_KEY, JSON.stringify(merged), new Date().toISOString());
  return merged;
}

export function resetSiteContent(): SiteContent {
  db().prepare("DELETE FROM site_content WHERE key = ?").run(SITE_CONTENT_KEY);
  return defaultSiteContent;
}

// ── Partners / ecosystem logos ───────────────────────────────────────────────

export function getSponsorLogos(): SponsorLogo[] {
  const rows = db()
    .prepare(
      `SELECT id, name, logo_url, href, invert, brightness, sort_order
       FROM sponsor_logos ORDER BY sort_order ASC, id ASC`,
    )
    .all() as Array<Omit<SponsorLogo, "invert"> & { invert: 0 | 1 }>;
  return rows.map((s) => ({ ...s, invert: Boolean(s.invert) }));
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
  if (!name || !logoUrl) throw new Error("Name and logo URL are required");

  const href = input.href?.trim() ? input.href.trim().slice(0, 500) : null;
  const invert = input.invert === false ? 0 : 1;
  const brightness = Number.isFinite(input.brightness) ? Math.min(1.5, Math.max(0.3, input.brightness!)) : 0.9;
  const sortOrder = Number.isFinite(input.sort_order) ? Math.trunc(input.sort_order!) : 0;

  let id = input.id;
  if (id) {
    db()
      .prepare(
        `UPDATE sponsor_logos SET name = ?, logo_url = ?, href = ?, invert = ?, brightness = ?, sort_order = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(name, logoUrl, href, invert, brightness, sortOrder, now, id);
  } else {
    const result = db()
      .prepare(
        `INSERT INTO sponsor_logos (name, logo_url, href, invert, brightness, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(name, logoUrl, href, invert, brightness, sortOrder, now, now);
    id = Number(result.lastInsertRowid);
  }

  const row = db()
    .prepare("SELECT id, name, logo_url, href, invert, brightness, sort_order FROM sponsor_logos WHERE id = ?")
    .get(id) as (Omit<SponsorLogo, "invert"> & { invert: 0 | 1 }) | undefined;
  if (!row) throw new Error("Partner was not saved");
  return { ...row, invert: Boolean(row.invert) };
}

export function deleteSponsorLogo(id: number): boolean {
  return db().prepare("DELETE FROM sponsor_logos WHERE id = ?").run(id).changes > 0;
}

// ── Achievements ─────────────────────────────────────────────────────────────

export type Achievement = {
  id: number;
  title: string;
  event_name: string;
  description: string;
  date: string;
  place: string;
  image_url: string | null;
  created_at: string;
};

export function getAchievements(): Achievement[] {
  return db().prepare("SELECT * FROM achievements ORDER BY date DESC").all() as Achievement[];
}
