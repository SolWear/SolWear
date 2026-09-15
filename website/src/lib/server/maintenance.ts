import { cookies } from "next/headers";
import { getSettings, type SiteSettings } from "./settings";
import { unpack, type SolWearSession } from "./session";

/**
 * Coming-soon mode gate. Returns the settings to render the holding page with,
 * or null when the visitor should see the real site. Admins always pass.
 */
export async function comingSoonFor(): Promise<SiteSettings | null> {
  const settings = getSettings();
  if (!settings.comingSoon) return null;

  const cookieStore = await cookies();
  const session = unpack<SolWearSession>(cookieStore.get("sw_session")?.value);
  return session?.isAdmin ? null : settings;
}
