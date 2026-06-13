import { headers } from "next/headers";
import { getPageBySlug } from "@/lib/pageService";
import { PageRenderer } from "@/renderer/PageRenderer";
import type { PageDocument } from "@/types/page";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";
  const page = await getPageBySlug(tenantSlug, "home");

  if (page && page.status === "published") {
    const document = JSON.parse(page.content) as PageDocument;
    return <PageRenderer document={document} />;
  }

  // Fallback welcome page
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
      <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
      <p className="text-gray-600 text-lg max-w-md">
        Your site is ready. Log in to the admin panel to start building your pages.
      </p>
      <Link
        href="/admin"
        className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
      >
        Go to Admin
      </Link>
    </div>
  );
}
