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

  let warning: string | undefined;

  if (file.type.startsWith("image/")) {
    const sharpImg = sharp(buffer);
    const meta = await sharpImg.metadata();
    // Resize to max 1920px on either dimension, never upscale
    const resized = sharpImg.resize(1920, 1920, { fit: "inside", withoutEnlargement: true });
    const encoded = await resized.webp({ quality: 75 }).toBuffer({ resolveWithObject: true });
    width = encoded.info.width;
    height = encoded.info.height;
    await require("fs/promises").writeFile(filePath, encoded.data);
    const sizeKb = Math.round(encoded.data.byteLength / 1024);
    if (sizeKb > 800) {
      warning = `Image is large (${sizeKb}KB). Please optimise your image before uploading for better performance.`;
    }
  } else {
    await writeFile(filePath, buffer);
  }

  const url = `/uploads/${tenantSlug}/${filename}`;
  const db = await getTenantDb(tenantSlug);
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

  return NextResponse.json({ id, url, width, height, ...(warning ? { warning } : {}) });
}
