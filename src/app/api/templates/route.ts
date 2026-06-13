export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { templates } from "@/db/schema/tenant";
import { desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const list = await db.select().from(templates).orderBy(desc(templates.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const body = await req.json();
  const id = generateId();
  await db.insert(templates).values({
    id,
    name: body.name,
    category: body.category ?? null,
    thumbnail: body.thumbnail ?? null,
    content: typeof body.content === "string" ? body.content : JSON.stringify(body.content),
    createdAt: new Date(),
  });
  return NextResponse.json({ id }, { status: 201 });
}
