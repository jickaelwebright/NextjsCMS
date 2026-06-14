export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { digitalDeliveries, products } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";
  const db = await getTenantDb(tenantSlug);

  const delivery = await db.select().from(digitalDeliveries).where(eq(digitalDeliveries.token, token)).get();

  if (!delivery) {
    return new NextResponse("Download link not found.", { status: 404 });
  }

  if (delivery.downloadCount >= delivery.downloadLimit) {
    return new NextResponse("Download limit reached.", { status: 410 });
  }

  if (new Date() > delivery.expiresAt) {
    return new NextResponse("Download link has expired.", { status: 410 });
  }

  // Increment download count
  await db.update(digitalDeliveries)
    .set({ downloadCount: delivery.downloadCount + 1 })
    .where(eq(digitalDeliveries.token, token));

  // Get the product's download files
  const product = await db.select().from(products).where(eq(products.id, delivery.productId)).get();
  if (!product) return new NextResponse("Product not found.", { status: 404 });

  const files: Array<{ name: string; url: string }> = JSON.parse(product.downloadFiles);
  if (!files.length) return new NextResponse("No files available.", { status: 404 });

  // Redirect to the first file URL (or serve all via a download page)
  const fileUrl = files[0].url;

  // If internal upload, proxy the file; if external URL, redirect
  if (fileUrl.startsWith("/")) {
    return NextResponse.redirect(new URL(fileUrl, req.url));
  }
  return NextResponse.redirect(fileUrl);
}
