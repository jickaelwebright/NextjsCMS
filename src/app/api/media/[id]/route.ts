export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { media } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenantSlug = (session.user as any).tenantSlug;
  const db = await getTenantDb(tenantSlug);

  const item = await db.select().from(media).where(eq(media.id, id)).get();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete file from disk (best effort)
  try {
    const filePath = path.join(process.cwd(), "public", item.url);
    await unlink(filePath);
  } catch {
    // File may already be missing — continue with DB deletion
  }

  await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ success: true });
}
