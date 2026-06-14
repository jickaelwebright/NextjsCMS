export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { products } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { generateId } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  type: z.enum(["physical", "digital", "variable"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = getTenantDb(tenantSlug);
  const type = req.nextUrl.searchParams.get("type");
  const status = req.nextUrl.searchParams.get("status");
  let list = await db.select().from(products).orderBy(desc(products.createdAt));
  if (type) list = list.filter((p) => p.type === type);
  if (status) list = list.filter((p) => p.status === status);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  if (!await isAddonEnabled(tenantSlug, "shop")) return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });

  const db = getTenantDb(tenantSlug);
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const id = generateId();
  const now = new Date();
  await db.insert(products).values({
    id, title: parsed.data.title, slug: parsed.data.slug,
    type: parsed.data.type ?? "physical", status: "draft",
    price: 0, stock: 0, stockTracking: false,
    images: "[]", categories: "[]", downloadFiles: "[]",
    createdAt: now, updatedAt: now,
  });
  return NextResponse.json({ id }, { status: 201 });
}
