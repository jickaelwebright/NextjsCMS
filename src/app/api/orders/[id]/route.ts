export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { orders } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = getTenantDb(tenantSlug);
  const order = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = getTenantDb(tenantSlug);
  const { status, notes } = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  await db.update(orders).set(updates as any).where(eq(orders.id, id));
  return NextResponse.json({ success: true });
}
