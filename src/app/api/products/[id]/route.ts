export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { products } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  const product = await db.select().from(products).where(eq(products.id, id)).get();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  const body = await req.json();
  await db.update(products).set({
    title: body.title,
    slug: body.slug,
    description: body.description ?? "",
    shortDescription: body.shortDescription ?? null,
    type: body.type,
    status: body.status,
    price: Math.round((body.price ?? 0) * 100),
    salePrice: body.salePrice ? Math.round(body.salePrice * 100) : null,
    sku: body.sku ?? null,
    stock: body.stock ?? 0,
    stockTracking: body.stockTracking ?? false,
    images: JSON.stringify(body.images ?? []),
    categories: JSON.stringify(body.categories ?? []),
    downloadFiles: JSON.stringify(body.downloadFiles ?? []),
    weight: body.weight ?? null,
    updatedAt: new Date(),
  }).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
