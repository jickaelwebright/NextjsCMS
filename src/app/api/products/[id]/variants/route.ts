export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { productVariants } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
  return NextResponse.json(variants);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  const body = await req.json();
  const variantId = generateId();
  await db.insert(productVariants).values({
    id: variantId,
    productId: id,
    name: body.name,
    sku: body.sku ?? null,
    price: Math.round((body.price ?? 0) * 100),
    salePrice: body.salePrice ? Math.round(body.salePrice * 100) : null,
    stock: body.stock ?? 0,
    attributes: JSON.stringify(body.attributes ?? {}),
    createdAt: new Date(),
  });
  return NextResponse.json({ id: variantId });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = await getTenantDb(tenantSlug);
  const body: Array<{ id: string; name: string; sku?: string; price: number; salePrice?: number; stock: number; attributes?: Record<string, string> }> = await req.json();
  const { id: productId } = await params;

  await db.delete(productVariants).where(eq(productVariants.productId, productId));
  for (const v of body) {
    await db.insert(productVariants).values({
      id: v.id || generateId(),
      productId,
      name: v.name,
      sku: v.sku ?? null,
      price: Math.round((v.price ?? 0) * 100),
      salePrice: v.salePrice ? Math.round(v.salePrice * 100) : null,
      stock: v.stock ?? 0,
      attributes: JSON.stringify(v.attributes ?? {}),
      createdAt: new Date(),
    });
  }
  return NextResponse.json({ success: true });
}
