export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suspendTenant } from "@/lib/tenantService";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "superadmin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await suspendTenant(id);
  return NextResponse.json({ success: true });
}
