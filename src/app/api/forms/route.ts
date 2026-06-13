export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { formSubmissions } from "@/db/schema/tenant";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const tenantSlug = (await headers()).get("x-tenant-slug");
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();
  const db = getTenantDb(tenantSlug);
  const id = generateId();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  await db.insert(formSubmissions).values({
    id,
    formId: body.formId ?? "inline",
    data: JSON.stringify(body.data ?? body),
    submittedAt: new Date(),
    ipAddress: ip,
  });

  return NextResponse.json({ success: true });
}
