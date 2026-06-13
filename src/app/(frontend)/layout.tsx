import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { globalRegions } from "@/db/schema/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import type { PageDocument } from "@/types/page";
import { PageRenderer } from "@/renderer/PageRenderer";

async function getSiteName(tenantSlug: string): Promise<string> {
  try {
    const db = getTenantDb(tenantSlug);
    const name = await db.select().from(siteSettings).where(eq(siteSettings.key, "siteName")).get();
    return name?.value ?? tenantSlug;
  } catch { return tenantSlug; }
}

async function getRegion(tenantSlug: string, id: "header" | "footer"): Promise<PageDocument | null> {
  try {
    const db = getTenantDb(tenantSlug);
    const region = await db.select().from(globalRegions).where(eq(globalRegions.id, id)).get();
    if (!region || region.content === "{}") return null;
    return JSON.parse(region.content) as PageDocument;
  } catch { return null; }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";
  const siteName = await getSiteName(tenantSlug);
  const headerDoc = await getRegion(tenantSlug, "header");
  const footerDoc = await getRegion(tenantSlug, "footer");

  return (
    <div className="flex flex-col min-h-screen">
      {headerDoc ? (
        <PageRenderer document={headerDoc} />
      ) : (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <a href="/" className="text-xl font-bold text-gray-900">{siteName}</a>
        </header>
      )}
      <div className="flex-1">{children}</div>
      {footerDoc ? (
        <PageRenderer document={footerDoc} />
      ) : (
        <footer className="bg-gray-50 border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {siteName}
        </footer>
      )}
    </div>
  );
}
