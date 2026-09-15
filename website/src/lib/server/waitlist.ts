import { db } from "./db";

export type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
  source: string | null;
  referrer: string | null;
  x_user_id: string | null;
  x_username: string | null;
  status: string;
};

export type JoinResult = { created: boolean; entry: WaitlistEntry };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

function byEmail(email: string): WaitlistEntry | undefined {
  return db().prepare("SELECT * FROM notify_emails WHERE email = ?").get(email) as WaitlistEntry | undefined;
}

/**
 * Idempotent join. An email that is already on the list returns created:false
 * instead of erroring, so the UI can say "you're already on the list".
 */
export function joinWaitlist(input: {
  email: string;
  source?: string | null;
  referrer?: string | null;
  xUserId?: string | null;
  xUsername?: string | null;
}): JoinResult {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("INVALID_EMAIL");

  const database = db();
  return database.transaction(() => {
    const result = database
      .prepare(
        `INSERT OR IGNORE INTO notify_emails
          (email, created_at, source, referrer, x_user_id, x_username, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      )
      .run(
        email,
        new Date().toISOString(),
        input.source?.trim().slice(0, 120) || null,
        input.referrer?.trim().slice(0, 500) || null,
        input.xUserId ?? null,
        input.xUsername?.trim().slice(0, 50) || null,
      );

    let entry = byEmail(email)!;
    if (!result.changes && input.xUserId && !entry.x_user_id) {
      database
        .prepare("UPDATE notify_emails SET x_user_id = ?, x_username = ? WHERE id = ? AND x_user_id IS NULL")
        .run(input.xUserId, input.xUsername?.trim().slice(0, 50) || null, entry.id);
      entry = byEmail(email)!;
    }
    return { created: result.changes > 0, entry };
  })();
}

export function findByXUserId(xUserId: string): WaitlistEntry | undefined {
  return db().prepare("SELECT * FROM notify_emails WHERE x_user_id = ?").get(xUserId) as WaitlistEntry | undefined;
}

/** Attaches an X account to an existing email record without creating duplicates. */
export function linkXAccount(email: string, xUserId: string, xUsername: string): JoinResult {
  const alreadyLinked = findByXUserId(xUserId);
  if (alreadyLinked) return { created: false, entry: alreadyLinked };
  return joinWaitlist({ email, xUserId, xUsername, source: "community" });
}

export function listWaitlist(limit = 1000, offset = 0): WaitlistEntry[] {
  return db()
    .prepare("SELECT * FROM notify_emails ORDER BY id DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as WaitlistEntry[];
}

export function waitlistCount(): number {
  return (db().prepare("SELECT COUNT(*) AS c FROM notify_emails").get() as { c: number }).c;
}

export function deleteWaitlistEntry(id: number): boolean {
  return db().prepare("DELETE FROM notify_emails WHERE id = ?").run(id).changes > 0;
}

/** Emails that appear more than once after normalization — should always be empty. */
export function duplicateEmails(): Array<{ email: string; count: number }> {
  return db()
    .prepare(
      `SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS count
       FROM notify_emails GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1`,
    )
    .all() as Array<{ email: string; count: number }>;
}

export function waitlistCsv(): string {
  const rows = listWaitlist(100000);
  const head = "email,created_at,source,referrer,x_username,status";
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    head,
    ...rows.map((r) => [r.email, r.created_at, r.source, r.referrer, r.x_username, r.status].map(esc).join(",")),
  ].join("\n");
}
