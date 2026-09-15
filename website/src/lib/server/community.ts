import { db } from "./db";

export type CommunityUser = {
  x_user_id: string;
  username: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  last_seen_at: string;
};

/** Upserts on every successful X login. One row per X account, never duplicated. */
export function touchCommunityUser(xUserId: string, username: string, isAdmin: boolean): CommunityUser {
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO community_users (x_user_id, username, role, status, created_at, last_seen_at)
       VALUES (?, ?, ?, 'active', ?, ?)
       ON CONFLICT(x_user_id) DO UPDATE SET
         username = excluded.username,
         last_seen_at = excluded.last_seen_at,
         role = CASE WHEN ? THEN 'admin' ELSE community_users.role END`,
    )
    .run(xUserId, username, isAdmin ? "admin" : "member", now, now, isAdmin ? 1 : 0);
  return getCommunityUser(xUserId)!;
}

export function getCommunityUser(xUserId: string): CommunityUser | undefined {
  return db().prepare("SELECT * FROM community_users WHERE x_user_id = ?").get(xUserId) as
    | CommunityUser
    | undefined;
}

export function setCommunityEmail(xUserId: string, email: string): void {
  db().prepare("UPDATE community_users SET email = ? WHERE x_user_id = ?").run(email, xUserId);
}

export function listCommunityUsers(limit = 500): CommunityUser[] {
  return db()
    .prepare("SELECT * FROM community_users ORDER BY last_seen_at DESC LIMIT ?")
    .all(limit) as CommunityUser[];
}

export function communityCount(): number {
  return (db().prepare("SELECT COUNT(*) AS c FROM community_users").get() as { c: number }).c;
}

export function setCommunityStatus(xUserId: string, status: "active" | "banned"): boolean {
  return db().prepare("UPDATE community_users SET status = ? WHERE x_user_id = ?").run(status, xUserId).changes > 0;
}

export function setCommunityRole(xUserId: string, role: "member" | "builder" | "admin"): boolean {
  return db().prepare("UPDATE community_users SET role = ? WHERE x_user_id = ?").run(role, xUserId).changes > 0;
}
