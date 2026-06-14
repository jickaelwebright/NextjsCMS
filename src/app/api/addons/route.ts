export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADDONS } from "@/addons/registry";
import { isAddonEnabled, enableAddon, disableAddon, getEnabledAddons } from "@/lib/addonService";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const enabled = await getEnabledAddons(tenantSlug);
  const list = ADDONS.map((a) => ({ ...a, enabled: enabled.includes(a.name) }));
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;
  const { name, action } = await req.json();
  if (!name || !["enable", "disable"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (action === "enable") {
    await enableAddon(tenantSlug, name);
  } else {
    await disableAddon(tenantSlug, name);
  }
  return NextResponse.json({ success: true });
}
