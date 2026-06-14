import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema/tenant";
import { generateId } from "@/lib/utils";
import { STARTER_TEMPLATES } from "@/lib/starterTemplates";

type TenantDb = BetterSQLite3Database<typeof schema>;

const cache = new Map<string, TenantDb>();

function initTenantDb(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'draft',
      page_type TEXT NOT NULL DEFAULT 'page',
      content TEXT NOT NULL DEFAULT '{}',
      thumbnail_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      published_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      url TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      thumbnail TEXT,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fields TEXT NOT NULL DEFAULT '[]',
      email_to TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data TEXT NOT NULL,
      submitted_at INTEGER NOT NULL,
      ip_address TEXT
    );
    CREATE TABLE IF NOT EXISTS global_regions (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '{}',
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS addon_settings (
      key TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL DEFAULT '{}',
      enabled_at INTEGER
    );
  `);
}

function seedStarterTemplates(sqlite: Database.Database) {
  const count = (sqlite.prepare("SELECT COUNT(*) as n FROM templates").get() as { n: number }).n;
  if (count > 0) return;
  const now = Math.floor(Date.now() / 1000);
  const stmt = sqlite.prepare(
    "INSERT INTO templates (id, name, category, thumbnail, content, created_at) VALUES (?, ?, ?, NULL, ?, ?)"
  );
  for (const t of STARTER_TEMPLATES) {
    stmt.run(generateId(), t.name, t.category, JSON.stringify(t.content), now);
  }
}

export function getTenantDb(tenantSlug: string): TenantDb {
  if (cache.has(tenantSlug)) {
    return cache.get(tenantSlug)!;
  }

  const dbPath = path.join(process.cwd(), "data", `tenant-${tenantSlug}.db`);
  const sqlite = new Database(dbPath);
  initTenantDb(sqlite);
  seedStarterTemplates(sqlite);
  const db = drizzle(sqlite, { schema });
  cache.set(tenantSlug, db);
  return db;
}
