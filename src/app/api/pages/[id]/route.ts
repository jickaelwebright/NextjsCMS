export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPageById, updatePageContent, updatePageMeta, deletePage } from "@/lib/pageService";
import type { PageDocument } from "@/types/page";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  const page = await getPageById(tenantSlug, id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  const document: PageDocument = await req.json();
  await updatePageContent(tenantSlug, id, document);
  return NextResponse.json({ success: true });
}

const MetaSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9/-]+$/).optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  const body = await req.json();
  const parsed = MetaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await updatePageMeta(tenantSlug, id, parsed.data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  await deletePage(tenantSlug, id);
  return NextResponse.json({ success: true });
}
