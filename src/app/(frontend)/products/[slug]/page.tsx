import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTenantDb } from "@/db/tenant";
import { products, productVariants } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { AddToCartButton } from "./AddToCartButton";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";

  let product: typeof products.$inferSelect | undefined;
  let variants: typeof productVariants.$inferSelect[] = [];

  try {
    const db = getTenantDb(tenantSlug);
    product = await db.select().from(products).where(eq(products.slug, slug)).get();
    if (product) {
      variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
    }
  } catch {
    // shop may not be enabled
  }

  if (!product || product.status !== "published") notFound();

  const imgs: string[] = JSON.parse(product.images);
  const displayPrice = (product.salePrice ?? product.price) / 100;
  const wasPrice = product.salePrice ? product.price / 100 : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          {imgs[0] ? (
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              <img src={imgs[0]} alt={product.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-5xl mb-3">📦</div>
          )}
          {imgs.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {imgs.slice(1).map((img, i) => (
                <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border" />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          {product.shortDescription && <p className="text-gray-600 mb-4">{product.shortDescription}</p>}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
            {wasPrice && <span className="text-lg text-gray-400 line-through">${wasPrice.toFixed(2)}</span>}
            {product.type === "digital" && <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Digital Download</span>}
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          <AddToCartButton
            product={{ id: product.id, title: product.title, slug: product.slug, price: product.salePrice ?? product.price, image: imgs[0] }}
            variants={variants.map((v) => ({ id: v.id, name: v.name, price: v.salePrice ?? v.price, stock: v.stock }))}
            type={product.type}
            stockTracking={product.stockTracking}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}
