export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenants, createTenant } from "@/lib/tenantService";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  customDomain: z.string().optional(),
});

async function requireSuperadmin(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "superadmin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireSuperadmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const list = await getTenants();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperadmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createTenant(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
