export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { globalRegions } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = await getTenantDb(tenantSlug);
  const regionId = req.nextUrl.searchParams.get("id") ?? "header";
  const region = await db.select().from(globalRegions).where(eq(globalRegions.id, regionId)).get();
  return NextResponse.json(region ?? { id: regionId, content: "{}", updatedAt: new Date() });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = await getTenantDb(tenantSlug);
  const body = await req.json();
  const regionId = body.id as string;
  const content = typeof body.content === "string" ? body.content : JSON.stringify(body.content);
  const existing = await db.select().from(globalRegions).where(eq(globalRegions.id, regionId)).get();
  if (existing) {
    await db.update(globalRegions).set({ content, updatedAt: new Date() }).where(eq(globalRegions.id, regionId));
  } else {
    await db.insert(globalRegions).values({ id: regionId, content, updatedAt: new Date() });
  }
  return NextResponse.json({ success: true });
}
