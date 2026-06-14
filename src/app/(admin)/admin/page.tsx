import { auth } from "@/lib/auth";
import { getPages } from "@/lib/pageService";
import { getTenantDb } from "@/db/tenant";
import { media } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { pages } from "@/db/schema/tenant";
import Link from "next/link";
import { FileText, Globe, Image, BookOpen, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const tenantSlug = (session?.user as any)?.tenantSlug ?? "default";
  const tenantName = (session?.user as any)?.tenantName ?? tenantSlug;

  const db = await getTenantDb(tenantSlug);
  const allPages = await db.select().from(pages).where(eq(pages.pageType, "page"));
  const allPosts = await db.select().from(pages).where(eq(pages.pageType, "post"));
  const allMedia = await db.select().from(media);
  const publishedCount = allPages.filter((p) => p.status === "published").length;
  const recentPages = [...allPages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Welcome back — {tenantName}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pages",     value: allPages.length,   icon: FileText, color: "blue" },
          { label: "Published", value: publishedCount,    icon: Globe,    color: "green" },
          { label: "Posts",     value: allPosts.length,   icon: BookOpen, color: "purple" },
          { label: "Media",     value: allMedia.length,   icon: Image,    color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/admin/pages" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Page
        </Link>
        <Link href="/admin/posts" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
          <Plus size={16} /> New Post
        </Link>
        <Link href="/admin/media" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          Upload Media
        </Link>
      </div>

      {/* Recent Pages */}
      {recentPages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Pages</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{page.title}</p>
                  <p className="text-xs text-gray-400">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${page.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {page.status}
                  </span>
                  <Link href={`/admin/builder/${page.id}`} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
