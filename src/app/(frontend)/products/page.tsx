import { headers } from "next/headers";
import Link from "next/link";
import { getTenantDb } from "@/db/tenant";
import { products } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export const revalidate = 60;

export default async function ProductsPage() {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";

  let items: typeof products.$inferSelect[] = [];
  try {
    const db = getTenantDb(tenantSlug);
    items = await db.select().from(products).where(eq(products.status, "published"));
  } catch {
    // shop tables may not exist
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => {
            const imgs: string[] = JSON.parse(p.images);
            const displayPrice = (p.salePrice ?? p.price) / 100;
            const wasPrice = p.salePrice ? p.price / 100 : null;
            return (
              <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {imgs[0] ? (
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img src={imgs[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                    📦
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-1 truncate">{p.title}</h2>
                  {p.shortDescription && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{p.shortDescription}</p>}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                    {wasPrice && <span className="text-sm text-gray-400 line-through">${wasPrice.toFixed(2)}</span>}
                    {p.type === "digital" && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Digital</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
