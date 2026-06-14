import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";

  let siteUrl = "";
  try {
    const db = await getTenantDb(tenantSlug);
    const urlSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, "site_url")).get();
    siteUrl = (urlSetting?.value ?? "").replace(/\/$/, "");
  } catch { /* use empty */ }

  if (!siteUrl) {
    siteUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/superadmin", "/api/", "/login", "/setup"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
