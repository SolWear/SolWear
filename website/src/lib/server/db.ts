import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { dataDir } from "./env";

type GlobalWithDb = typeof globalThis & { __solwearDb?: Database.Database };

export function db(): Database.Database {
  const g = globalThis as GlobalWithDb;
  if (g.__solwearDb) return g.__solwearDb;

  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });
  const database = new Database(path.join(dir, "solwear.db"));
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS notify_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_notify_emails_email ON notify_emails (email);

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

    CREATE TABLE IF NOT EXISTS admin_tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS thanks_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT NOT NULL,
      twitter_username TEXT,
      avatar_url TEXT,
      stage INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS idea_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL REFERENCES pinboard_ideas(id) ON DELETE CASCADE,
      x_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(idea_id, x_user_id)
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
  `);

  const now = new Date().toISOString();
  database.prepare(`
    INSERT OR IGNORE INTO sponsor_logos (name, logo_url, href, invert, brightness, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "SuperTeam Ukraine",
    "https://superteam.fun/static/logo-light.svg",
    "https://superteam.fun/ukraine",
    0,
    1.0,
    10,
    now,
    now,
  );

  database.prepare(`
    INSERT OR IGNORE INTO achievements (id, title, event_name, description, date, place, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    "1st place - Dev3pak Hackathon",
    "Dev3pak",
    "SolWear won first place at the Dev3pak hackathon, demonstrating the wearable Solana signer prototype with NFC-based transaction approval.",
    "2026-04-01",
    "1st",
    now,
  );

  // Non-destructive column additions for existing deployments
  try { database.exec("ALTER TABLE achievements ADD COLUMN image_url TEXT"); } catch {}
  try { database.exec("ALTER TABLE thanks_entries ADD COLUMN description TEXT"); } catch {}

  g.__solwearDb = database;
  return database;
}
