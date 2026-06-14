export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { orders } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = getTenantDb(tenantSlug);
  const status = req.nextUrl.searchParams.get("status");
  let list = await db.select().from(orders).orderBy(desc(orders.createdAt));
  if (status) list = list.filter((o) => o.status === status);
  return NextResponse.json(list);
}
