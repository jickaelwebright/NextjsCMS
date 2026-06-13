import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema/superadmin";

type SuperadminDb = BetterSQLite3Database<typeof schema>;

let _db: SuperadminDb | null = null;

function createSuperadminDb(): SuperadminDb {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "superadmin.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      custom_domain TEXT,
      admin_email TEXT NOT NULL,
      admin_password_hash TEXT NOT NULL,
      db_path TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    )
  `);
  return drizzle(sqlite, { schema });
}

export function getSuperadminDb(): SuperadminDb {
  if (!_db) _db = createSuperadminDb();
  return _db;
}

// Convenience alias
export const superadminDb = new Proxy({} as SuperadminDb, {
  get(_target, prop) {
    return (getSuperadminDb() as any)[prop];
  },
});
