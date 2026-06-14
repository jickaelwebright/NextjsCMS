import { getSuperadminDb } from "@/db/superadmin";
import { tenants } from "@/db/schema/superadmin";
import { eq } from "drizzle-orm";

export async function resolveTenantFromHost(host: string): Promise<string | null> {
  const db = await getSuperadminDb();
  const cleanHost = host.split(":")[0];

  const byDomain = await db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.customDomain, cleanHost)).get();
  if (byDomain) return byDomain.slug;

  const parts = cleanHost.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const bySlug = await db.select({ slug: tenants.slug, plan: tenants.plan }).from(tenants).where(eq(tenants.slug, subdomain)).get();
    if (bySlug && bySlug.plan === "active") return bySlug.slug;
  }
  return null;
}

export async function resolveTenantFromPath(pathname: string): Promise<string | null> {
  const db = await getSuperadminDb();
  const match = pathname.match(/^\/sites\/([^/]+)/);
  if (!match) return null;
  const slug = match[1];
  const tenant = await db.select({ slug: tenants.slug, plan: tenants.plan }).from(tenants).where(eq(tenants.slug, slug)).get();
  return tenant?.plan === "active" ? tenant.slug : null;
}
