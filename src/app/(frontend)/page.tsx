import { headers } from "next/headers";
import { getPageBySlug } from "@/lib/pageService";
import { getTenantDb } from "@/db/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { PageRenderer } from "@/renderer/PageRenderer";
import { JsonLd } from "@/components/JsonLd";
import type { PageDocument } from "@/types/page";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

async function getTenantSlug() {
  const hdrs = await headers();
  return hdrs.get("x-tenant-slug") ?? "default";
}

async function getSiteSettings(tenantSlug: string): Promise<Record<string, string>> {
  try {
    const db = getTenantDb(tenantSlug);
    const rows = await db.select().from(siteSettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch { return {}; }
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantSlug = await getTenantSlug();
  const site = await getSiteSettings(tenantSlug);
  const page = await getPageBySlug(tenantSlug, "home");

  const siteName = site.siteName ?? site.org_name ?? tenantSlug;
  const siteUrl = (site.site_url ?? "").replace(/\/$/, "");

  if (page && page.status === "published") {
    const doc = JSON.parse(page.content) as PageDocument;
    const ogImage = doc.meta.ogImage
      ? (doc.meta.ogImage.startsWith("http") ? doc.meta.ogImage : siteUrl + doc.meta.ogImage)
      : undefined;
    return {
      title: doc.meta.title ?? siteName,
      description: doc.meta.description ?? site.siteDescription,
      ...(doc.meta.noIndex ? { robots: { index: false, follow: false } } : {}),
      ...(siteUrl ? { alternates: { canonical: siteUrl || "/" } } : {}),
      openGraph: {
        title: doc.meta.title ?? siteName,
        description: doc.meta.description ?? site.siteDescription,
        siteName,
        locale: "en_AU",
        type: "website",
        ...(ogImage ? { images: [ogImage] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: doc.meta.title ?? siteName,
        description: doc.meta.description,
      },
    };
  }

  return {
    title: siteName,
    description: site.siteDescription,
    openGraph: { title: siteName, siteName, locale: "en_AU", type: "website" },
  };
}

export default async function HomePage() {
  const tenantSlug = await getTenantSlug();
  const site = await getSiteSettings(tenantSlug);
  const page = await getPageBySlug(tenantSlug, "home");

  const siteName = site.siteName ?? site.org_name ?? tenantSlug;
  const siteUrl = (site.site_url ?? "").replace(/\/$/, "");

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.org_name ?? siteName,
    url: siteUrl || undefined,
    ...(site.org_logo_url ? { logo: site.org_logo_url } : {}),
    ...(site.siteDescription ? { description: site.siteDescription } : {}),
  };

  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl || "/",
  };

  if (page && page.status === "published") {
    const document = JSON.parse(page.content) as PageDocument;
    return (
      <>
        <JsonLd data={webSiteLd} />
        <JsonLd data={orgLd} />
        <PageRenderer document={document} />
      </>
    );
  }

  return (
    <>
      <JsonLd data={webSiteLd} />
      <JsonLd data={orgLd} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
        <p className="text-gray-600 text-lg max-w-md">
          Your site is ready. Log in to the admin panel to start building your pages.
        </p>
        <Link href="/admin" className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
          Go to Admin
        </Link>
      </div>
    </>
  );
}
