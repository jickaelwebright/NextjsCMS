export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSuperadminDb } from "@/db/superadmin";
import { cmsSettings } from "@/db/schema/superadmin";
import { eq } from "drizzle-orm";

const DEFAULTS = {
  cms_name: "NextjsCMS",
  cms_tagline: "Sign in to your dashboard",
  cms_logo_url: "",
  cms_primary_color: "#6366f1",
  setup_complete: "false",
};

async function getSettings() {
  const db = await getSuperadminDb();
  const rows = await db.select().from(cmsSettings);
  const map: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const db = await getSuperadminDb();
  const body = await req.json();

  const allowed = ["cms_name", "cms_tagline", "cms_logo_url", "cms_primary_color", "setup_complete"];
  const pairs: { key: string; value: string }[] = [];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      pairs.push({ key, value: String(body[key]) });
    }
  }

  // Always mark setup_complete on explicit save
  if (!pairs.find((p) => p.key === "setup_complete")) {
    pairs.push({ key: "setup_complete", value: "true" });
  }

  for (const pair of pairs) {
    await db
      .insert(cmsSettings)
      .values(pair)
      .onConflictDoUpdate({ target: cmsSettings.key, set: { value: pair.value } });
  }

  return NextResponse.json({ ok: true });
}
