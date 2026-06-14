export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { formSubmissions } from "@/db/schema/tenant";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const rows = await db
    .select()
    .from(formSubmissions)
    .orderBy(desc(formSubmissions.submittedAt));
  return NextResponse.json(rows);
}
