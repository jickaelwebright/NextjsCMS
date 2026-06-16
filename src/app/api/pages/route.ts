export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPage, getPages } from "@/lib/pageService";
import { z } from "zod";

const CreatePageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  pageType: z.enum(["page", "post", "landing"]).optional(),
  templateId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const type = req.nextUrl.searchParams.get("type") ?? undefined;
  const list = await getPages(tenantSlug, type);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const body = await req.json();
  const parsed = CreatePageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createPage(tenantSlug, parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
