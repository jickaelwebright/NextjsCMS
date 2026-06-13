import { superadminDb } from "@/db/superadmin";
import { tenants } from "@/db/schema/superadmin";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateId } from "./utils";

export async function getTenants() {
  return superadminDb.select().from(tenants);
}

export async function getTenantBySlug(slug: string) {
  return superadminDb.select().from(tenants).where(eq(tenants.slug, slug)).get();
}

export async function createTenant(data: {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  customDomain?: string;
}) {
  const id = generateId();
  const hash = await bcrypt.hash(data.adminPassword, 10);
  await superadminDb.insert(tenants).values({
    id,
    slug: data.slug,
    name: data.name,
    customDomain: data.customDomain ?? null,
    adminEmail: data.adminEmail,
    adminPasswordHash: hash,
    dbPath: `data/tenant-${data.slug}.db`,
    plan: "active",
    createdAt: new Date(),
  });
  return id;
}

export async function suspendTenant(id: string) {
  await superadminDb.update(tenants).set({ plan: "suspended" }).where(eq(tenants.id, id));
}

export async function activateTenant(id: string) {
  await superadminDb.update(tenants).set({ plan: "active" }).where(eq(tenants.id, id));
}

export async function deleteTenant(id: string) {
  await superadminDb.delete(tenants).where(eq(tenants.id, id));
}
