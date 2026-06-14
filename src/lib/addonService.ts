import { getTenantDb } from "@/db/tenant";
import { addonSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import path from "path";

export async function isAddonEnabled(tenantSlug: string, addonName: string): Promise<boolean> {
  try {
    const db = getTenantDb(tenantSlug);
    const row = await db.select().from(addonSettings).where(eq(addonSettings.key, addonName)).get();
    return row?.enabled === true;
  } catch { return false; }
}

export async function getEnabledAddons(tenantSlug: string): Promise<string[]> {
  try {
    const db = getTenantDb(tenantSlug);
    const rows = await db.select().from(addonSettings);
    return rows.filter((r) => r.enabled).map((r) => r.key);
  } catch { return []; }
}

export async function enableAddon(tenantSlug: string, addonName: string): Promise<void> {
  const db = getTenantDb(tenantSlug);
  const existing = await db.select().from(addonSettings).where(eq(addonSettings.key, addonName)).get();
  if (existing) {
    await db.update(addonSettings).set({ enabled: true, enabledAt: new Date() }).where(eq(addonSettings.key, addonName));
  } else {
    await db.insert(addonSettings).values({ key: addonName, enabled: true, config: "{}", enabledAt: new Date() });
  }

  // Run addon-specific setup
  if (addonName === "shop") {
    createShopTables(tenantSlug);
  }
}

export async function disableAddon(tenantSlug: string, addonName: string): Promise<void> {
  const db = getTenantDb(tenantSlug);
  const existing = await db.select().from(addonSettings).where(eq(addonSettings.key, addonName)).get();
  if (existing) {
    await db.update(addonSettings).set({ enabled: false }).where(eq(addonSettings.key, addonName));
  } else {
    await db.insert(addonSettings).values({ key: addonName, enabled: false, config: "{}" });
  }
}

function createShopTables(tenantSlug: string) {
  const dbPath = path.join(process.cwd(), "data", `tenant-${tenantSlug}.db`);
  const sqlite = new Database(dbPath);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      short_description TEXT,
      type TEXT NOT NULL DEFAULT 'physical',
      status TEXT NOT NULL DEFAULT 'draft',
      price INTEGER NOT NULL DEFAULT 0,
      sale_price INTEGER,
      sku TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      stock_tracking INTEGER NOT NULL DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      categories TEXT NOT NULL DEFAULT '[]',
      download_files TEXT NOT NULL DEFAULT '[]',
      weight INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      sale_price INTEGER,
      stock INTEGER NOT NULL DEFAULT 0,
      attributes TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      billing_address TEXT NOT NULL DEFAULT '{}',
      shipping_address TEXT NOT NULL DEFAULT '{}',
      items TEXT NOT NULL DEFAULT '[]',
      subtotal INTEGER NOT NULL DEFAULT 0,
      shipping_cost INTEGER NOT NULL DEFAULT 0,
      tax INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      payment_ref TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS digital_deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      download_limit INTEGER NOT NULL DEFAULT 3,
      download_count INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  sqlite.close();
}
