export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getTenantDb } from "@/db/tenant";
import { media } from "@/db/schema/tenant";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantSlug = (session.user as any).tenantSlug;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", tenantSlug);
  await mkdir(uploadDir, { recursive: true });

  const id = generateId();
  const ext = "webp";
  const filename = `${id}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  let width: number | undefined;
  let height: number | undefined;

  if (file.type.startsWith("image/")) {
    const sharpImg = sharp(buffer);
    const meta = await sharpImg.metadata();
    width = meta.width;
    height = meta.height;
    await sharpImg.webp({ quality: 85 }).toFile(filePath);
  } else {
    await writeFile(filePath, buffer);
  }

  const url = `/uploads/${tenantSlug}/${filename}`;
  const db = getTenantDb(tenantSlug);
  await db.insert(media).values({
    id,
    filename,
    originalName: file.name,
    mimeType: "image/webp",
    size: file.size,
    width: width ?? null,
    height: height ?? null,
    url,
    createdAt: new Date(),
  });

  return NextResponse.json({ id, url, width, height });
}
