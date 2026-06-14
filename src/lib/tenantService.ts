import { getSuperadminDb } from "@/db/superadmin";
import { tenants } from "@/db/schema/superadmin";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateId } from "./utils";

export async function getTenants() {
  const db = await getSuperadminDb();
  return db.select().from(tenants);
}

export async function getTenantBySlug(slug: string) {
  const db = await getSuperadminDb();
  return db.select().from(tenants).where(eq(tenants.slug, slug)).get();
}

export async function createTenant(data: {
  name: string; slug: string; adminEmail: string;
  adminPassword: string; customDomain?: string;
}) {
  const db = await getSuperadminDb();
  const id = generateId();
  const hash = await bcrypt.hash(data.adminPassword, 10);
  await db.insert(tenants).values({
    id, slug: data.slug, name: data.name,
    customDomain: data.customDomain ?? null,
    adminEmail: data.adminEmail, adminPasswordHash: hash,
    dbPath: `data/tenant-${data.slug}.db`,
    plan: "active", createdAt: new Date(),
  });
  return id;
}

export async function suspendTenant(id: string) {
  const db = await getSuperadminDb();
  await db.update(tenants).set({ plan: "suspended" }).where(eq(tenants.id, id));
}

export async function activateTenant(id: string) {
  const db = await getSuperadminDb();
  await db.update(tenants).set({ plan: "active" }).where(eq(tenants.id, id));
}

export async function deleteTenant(id: string) {
  const db = await getSuperadminDb();
  await db.delete(tenants).where(eq(tenants.id, id));
}
