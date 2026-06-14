import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import path from "path";
import fs from "fs";
import * as schema from "./schema/superadmin";

type SuperadminDb = LibSQLDatabase<typeof schema>;

let _db: SuperadminDb | null = null;

function getDbPath(): string {
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "superadmin.db");
}

async function createSuperadminDb(): Promise<SuperadminDb> {
  const dbPath = getDbPath();
  const client = createClient({ url: `file:${dbPath}` });
  await client.execute(`
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
  await client.execute(`
    CREATE TABLE IF NOT EXISTS cms_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  return drizzle(client, { schema });
}

let _initPromise: Promise<SuperadminDb> | null = null;

export async function getSuperadminDb(): Promise<SuperadminDb> {
  if (_db) return _db;
  if (!_initPromise) _initPromise = createSuperadminDb().then((db) => { _db = db; return db; });
  return _initPromise;
}
