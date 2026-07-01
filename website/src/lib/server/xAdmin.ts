import { db } from "./db";

type AdminTokenRow = {
  access_token: string;
  refresh_token: string | null;
};

export function getAdminToken(): string | null {
  const row = db()
    .prepare("SELECT access_token FROM admin_tokens WHERE id = 1")
    .get() as AdminTokenRow | undefined;
  return row?.access_token ?? null;
}

export function saveAdminToken(accessToken: string, refreshToken?: string): void {
  db()
    .prepare(
      `INSERT INTO admin_tokens (id, access_token, refresh_token, updated_at)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         access_token = excluded.access_token,
         refresh_token = excluded.refresh_token,
         updated_at = excluded.updated_at`,
    )
    .run(accessToken, refreshToken ?? null, new Date().toISOString());
}

export async function fetchUserByHandle(
  username: string,
): Promise<{ id: string; username: string; profile_image_url?: string } | null> {
  const token = getAdminToken();
  if (!token) return null;

  const handle = username.replace(/^@/, "");
  const res = await fetch(
    `https://api.x.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=profile_image_url`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    data?: { id: string; username: string; profile_image_url?: string };
  };
  return data.data ?? null;
}
