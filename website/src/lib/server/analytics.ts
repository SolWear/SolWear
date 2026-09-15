import crypto from "node:crypto";
import { db } from "./db";

/**
 * Cookie-less visitor id: salted hash of IP + user agent, rotated daily.
 * Good enough to count unique visitors, useless as a cross-day identifier.
 */
export function visitorId(ip: string, userAgent: string, day: string): string {
  const salt = process.env.SESSION_SECRET ?? "solwear";
  return crypto.createHash("sha256").update(`${salt}:${day}:${ip}:${userAgent}`).digest("base64url").slice(0, 22);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function recordEvent(input: {
  event: string;
  path: string;
  visitorId: string;
  source?: string | null;
  referrer?: string | null;
}): void {
  const now = new Date();
  db()
    .prepare(
      `INSERT INTO analytics_events (event, path, visitor_id, source, referrer, created_at, day)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.event.slice(0, 40),
      input.path.slice(0, 200),
      input.visitorId,
      input.source?.slice(0, 120) ?? null,
      input.referrer?.slice(0, 300) ?? null,
      now.toISOString(),
      now.toISOString().slice(0, 10),
    );
}

export type AnalyticsSummary = {
  days: number;
  pageViews: number;
  uniqueVisitors: number;
  visits: number;
  waitlistConversions: number;
  communityRegistrations: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  topSources: Array<{ source: string; visits: number }>;
  daily: Array<{ day: string; views: number; visitors: number }>;
};

export function summary(days = 30): AnalyticsSummary {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const one = <T>(sql: string, ...args: unknown[]) => db().prepare(sql).get(...(args as [])) as T;
  const many = <T>(sql: string, ...args: unknown[]) => db().prepare(sql).all(...(args as [])) as T[];

  const pageViews = one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM analytics_events WHERE event = 'pageview' AND day >= ?",
    since,
  ).c;
  const uniqueVisitors = one<{ c: number }>(
    "SELECT COUNT(DISTINCT visitor_id) AS c FROM analytics_events WHERE day >= ?",
    since,
  ).c;
  const visits = one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM (SELECT DISTINCT visitor_id, day FROM analytics_events WHERE day >= ?)",
    since,
  ).c;
  const waitlistConversions = one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM analytics_events WHERE event = 'waitlist_join' AND day >= ?",
    since,
  ).c;
  const communityRegistrations = one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM analytics_events WHERE event = 'community_register' AND day >= ?",
    since,
  ).c;

  return {
    days,
    pageViews,
    uniqueVisitors,
    visits,
    waitlistConversions,
    communityRegistrations,
    // Clamped: on tiny samples a shared visitor hash can otherwise exceed 100%.
    conversionRate: uniqueVisitors
      ? Math.min(100, Math.round((waitlistConversions / uniqueVisitors) * 1000) / 10)
      : 0,
    topPages: many<{ path: string; views: number }>(
      `SELECT path, COUNT(*) AS views FROM analytics_events
       WHERE event = 'pageview' AND day >= ? GROUP BY path ORDER BY views DESC LIMIT 10`,
      since,
    ),
    topSources: many<{ source: string; visits: number }>(
      `SELECT COALESCE(NULLIF(source, ''), 'direct') AS source, COUNT(DISTINCT visitor_id) AS visits
       FROM analytics_events WHERE day >= ? GROUP BY source ORDER BY visits DESC LIMIT 10`,
      since,
    ),
    daily: many<{ day: string; views: number; visitors: number }>(
      `SELECT day, SUM(event = 'pageview') AS views, COUNT(DISTINCT visitor_id) AS visitors
       FROM analytics_events WHERE day >= ? GROUP BY day ORDER BY day ASC`,
      since,
    ),
  };
}
