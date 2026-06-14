import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { siteSettings, pages } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";

  let siteUrl = "";
  try {
    const db = await getTenantDb(tenantSlug);
    const urlSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, "site_url")).get();
    siteUrl = (urlSetting?.value ?? "").replace(/\/$/, "");
  } catch { /* use empty base */ }

  if (!siteUrl) {
    siteUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  }

  let publishedPages: Array<{ slug: string; pageType: string; updatedAt: Date | number | null }> = [];
  try {
    const db = await getTenantDb(tenantSlug);
    publishedPages = await db
      .select({ slug: pages.slug, pageType: pages.pageType, updatedAt: pages.updatedAt })
      .from(pages)
      .where(eq(pages.status, "published"));
  } catch { /* empty */ }

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // Blog index if there are posts
  const hasPosts = publishedPages.some((p) => p.pageType === "post");
  if (hasPosts) {
    entries.push({
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const page of publishedPages) {
    if (page.slug === "home" || page.slug === "/") continue;

    const lastMod = page.updatedAt
      ? new Date(typeof page.updatedAt === "number" ? page.updatedAt * 1000 : page.updatedAt)
      : new Date();

    const url = page.pageType === "post"
      ? `${siteUrl}/blog/${page.slug}`
      : `${siteUrl}/${page.slug}`;

    entries.push({
      url,
      lastModified: lastMod,
      changeFrequency: page.pageType === "post" ? "monthly" : "weekly",
      priority: page.pageType === "post" ? 0.7 : 0.8,
    });
  }

  return entries;
}
