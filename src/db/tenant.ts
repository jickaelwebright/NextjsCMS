import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import path from "path";
import fs from "fs";
import * as schema from "./schema/tenant";
import { generateId } from "@/lib/utils";
import { STARTER_TEMPLATES } from "@/lib/starterTemplates";

type TenantDb = LibSQLDatabase<typeof schema>;

const cache = new Map<string, Promise<TenantDb>>();

function getDataDir(): string {
  return process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
}

async function initTenantDb(tenantSlug: string): Promise<TenantDb> {
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, `tenant-${tenantSlug}.db`);
  const client = createClient({ url: `file:${dbPath}` });

  const tables = [
    `CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'draft', page_type TEXT NOT NULL DEFAULT 'page',
      content TEXT NOT NULL DEFAULT '{}', thumbnail_url TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, published_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL, size INTEGER NOT NULL, width INTEGER, height INTEGER,
      url TEXT NOT NULL, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, thumbnail TEXT,
      content TEXT NOT NULL, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, fields TEXT NOT NULL DEFAULT '[]',
      email_to TEXT, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY, form_id TEXT NOT NULL, data TEXT NOT NULL,
      submitted_at INTEGER NOT NULL, ip_address TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS global_regions (
      id TEXT PRIMARY KEY, content TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS addon_settings (
      key TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL DEFAULT '{}', enabled_at INTEGER
    )`,
  ];

  for (const sql of tables) await client.execute(sql);

  // Upsert starter templates (keeps content in sync with code on every deploy)
  const now = Math.floor(Date.now() / 1000);
  for (const t of STARTER_TEMPLATES) {
    const existing = await client.execute({
      sql: "SELECT id FROM templates WHERE name = ? LIMIT 1",
      args: [t.name],
    });
    if (existing.rows.length > 0) {
      await client.execute({
        sql: "UPDATE templates SET category = ?, content = ? WHERE name = ?",
        args: [t.category ?? null, JSON.stringify(t.content), t.name],
      });
    } else {
      await client.execute({
        sql: "INSERT INTO templates (id, name, category, thumbnail, content, created_at) VALUES (?, ?, ?, NULL, ?, ?)",
        args: [generateId(), t.name, t.category ?? null, JSON.stringify(t.content), now],
      });
    }
  }

  return drizzle(client, { schema });
}

export async function getTenantDb(tenantSlug: string): Promise<TenantDb> {
  if (!cache.has(tenantSlug)) {
    cache.set(tenantSlug, initTenantDb(tenantSlug));
  }
  return cache.get(tenantSlug)!;
}
