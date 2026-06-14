export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const all = await db.select().from(siteSettings);
  const result: Record<string, string> = {};
  all.forEach(({ key, value }) => { result[key] = value; });
  const keysParam = req.nextUrl.searchParams.get("keys");
  if (keysParam) {
    const keys = keysParam.split(",");
    const filtered: Record<string, string> = {};
    keys.forEach((k) => { if (result[k] !== undefined) filtered[k] = result[k]; });
    return NextResponse.json(filtered);
  }
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).get();
    if (existing) {
      await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value });
    }
  }
  return NextResponse.json({ success: true });
}
