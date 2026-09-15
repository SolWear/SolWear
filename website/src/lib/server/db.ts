import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { dataDir } from "./env";

type GlobalWithDb = typeof globalThis & { __solwearDb?: Database.Database };

/** Adds a column if it does not exist yet. Safe on every boot. */
function addColumn(database: Database.Database, table: string, definition: string): void {
  try {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  } catch {
    /* column already present */
  }
}

export function db(): Database.Database {
  const g = globalThis as GlobalWithDb;
  if (g.__solwearDb) return g.__solwearDb;

  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });
  const database = new Database(path.join(dir, "solwear.db"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    -- ── Waitlist ──────────────────────────────────────────────────────────────
    -- Historical name kept so existing signups survive the redesign.
    CREATE TABLE IF NOT EXISTS notify_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_notify_emails_email ON notify_emails (email);

    -- ── Community ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pinboard_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x_user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      idea TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      moderated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_pinboard_ideas_user ON pinboard_ideas (x_user_id);
    CREATE INDEX IF NOT EXISTS idx_pinboard_ideas_status_created ON pinboard_ideas (status, created_at);

    CREATE TABLE IF NOT EXISTS idea_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL REFERENCES pinboard_ideas(id) ON DELETE CASCADE,
      x_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(idea_id, x_user_id)
    );

    -- Community members, keyed by X account. One row per person.
    CREATE TABLE IF NOT EXISTS community_users (
      x_user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_community_users_email ON community_users (email);

    CREATE TABLE IF NOT EXISTS admin_tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      updated_at TEXT NOT NULL
    );

    -- ── Content ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sponsor_logos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      href TEXT,
      invert INTEGER NOT NULL DEFAULT 1,
      brightness REAL NOT NULL DEFAULT 0.9,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      event_name TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      place TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS thanks_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT NOT NULL,
      twitter_username TEXT,
      avatar_url TEXT,
      stage INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- ── Analytics ─────────────────────────────────────────────────────────────
    -- First-party, cookie-less. visitor_id is a daily-rotating salted hash.
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      path TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      source TEXT,
      referrer TEXT,
      created_at TEXT NOT NULL,
      day TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_day ON analytics_events (day);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_day ON analytics_events (event, day);
    CREATE INDEX IF NOT EXISTS idx_analytics_path_day ON analytics_events (path, day);
    CREATE INDEX IF NOT EXISTS idx_analytics_visitor_day ON analytics_events (visitor_id, day);
  `);

  // ── Non-destructive migrations for existing deployments ────────────────────
  addColumn(database, "achievements", "image_url TEXT");
  addColumn(database, "thanks_entries", "description TEXT");
  // Waitlist columns bolted onto the historical notify_emails table.
  addColumn(database, "notify_emails", "source TEXT");
  addColumn(database, "notify_emails", "referrer TEXT");
  addColumn(database, "notify_emails", "x_user_id TEXT");
  addColumn(database, "notify_emails", "x_username TEXT");
  addColumn(database, "notify_emails", "status TEXT NOT NULL DEFAULT 'active'");
  try {
    database.exec("CREATE INDEX IF NOT EXISTS idx_notify_emails_x_user ON notify_emails (x_user_id)");
  } catch {
    /* index depends on a column that may have just been added */
  }

  // No seed data. Records inserted here would run on every boot — the previous
  // seed had no unique constraint to catch, so it appended a duplicate partner
  // each time — and a hard-coded achievement risks shipping a claim that does
  // not match reality. Partners and achievements are admin-managed only.

  g.__solwearDb = database;
  return database;
}
