import { db } from "./db";

export type SiteSettings = {
  /** When true, non-admin visitors get the coming-soon experience. */
  comingSoon: boolean;
  comingSoonHeadline: string;
  comingSoonBody: string;
  seoTitle: string;
  seoDescription: string;
  social: {
    x: string;
    github: string;
    email: string;
  };
};

export const defaultSettings: SiteSettings = {
  comingSoon: false,
  comingSoonHeadline: "SOLWEAR IS ALMOST HERE",
  comingSoonBody: "WE ARE PUTTING THE FINISHING TOUCHES ON THE SITE. JOIN THE WAITLIST TO BE FIRST IN LINE.",
  seoTitle: "SOLWEAR",
  seoDescription:
    "SolWear is a wearable interface for the Solana ecosystem. Tap to pay, approve on your wrist, and keep the signing key off your phone.",
  social: {
    x: "https://x.com/SolWear_",
    github: "https://github.com/solwear/solwear",
    email: "developers@solwear.tech",
  },
};

const KEY = "settings";

export function getSettings(): SiteSettings {
  try {
    const row = db().prepare("SELECT value FROM site_content WHERE key = ?").get(KEY) as
      | { value: string }
      | undefined;
    if (!row?.value) return defaultSettings;
    const parsed = JSON.parse(row.value) as Partial<SiteSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      social: { ...defaultSettings.social, ...parsed.social },
    };
  } catch (error) {
    console.error("[settings] falling back to defaults:", error);
    return defaultSettings;
  }
}

export function saveSettings(next: SiteSettings): SiteSettings {
  const merged: SiteSettings = {
    ...defaultSettings,
    ...next,
    comingSoon: Boolean(next.comingSoon),
    social: { ...defaultSettings.social, ...next.social },
  };
  db()
    .prepare(
      `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(KEY, JSON.stringify(merged), new Date().toISOString());
  return merged;
}
