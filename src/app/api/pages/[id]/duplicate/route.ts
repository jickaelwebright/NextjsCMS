export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { duplicatePage } from "@/lib/pageService";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  const newId = await duplicatePage(tenantSlug, id);
  return NextResponse.json({ id: newId });
}
