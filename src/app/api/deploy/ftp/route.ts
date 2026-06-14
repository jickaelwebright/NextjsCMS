export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { pages, siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { testFTPConnection, uploadToFTP, absolutifyHtml } from "@/lib/ftpService";
import type { FTPConfig } from "@/lib/ftpService";

function getFTPConfig(settings: Record<string, string>): FTPConfig | null {
  const host = settings.ftp_host?.trim();
  const user = settings.ftp_user?.trim();
  const password = settings.ftp_password?.trim();
  if (!host || !user || !password) return null;
  return {
    host,
    port: parseInt(settings.ftp_port ?? "21"),
    user,
    password,
    remotePath: settings.ftp_remote_path?.trim() || "/public_html",
    secure: settings.ftp_secure === "true",
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantSlug = (session.user as any).tenantSlug;
  const db = getTenantDb(tenantSlug);
  const { action } = await req.json();

  // Load FTP credentials from tenant siteSettings
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  const config = getFTPConfig(settings);
  if (!config) {
    return NextResponse.json(
      { error: "FTP credentials not configured. Set them in Settings → FTP Deploy." },
      { status: 400 }
    );
  }

  // ── Test connection ───────────────────────────────────────────────────────
  if (action === "test") {
    const result = await testFTPConnection(config);
    return NextResponse.json(result);
  }

  // ── Deploy published pages ────────────────────────────────────────────────
  if (action === "deploy") {
    const publishedPages = await db
      .select()
      .from(pages)
      .where(eq(pages.status, "published"));

    if (publishedPages.length === 0) {
      return NextResponse.json({ error: "No published pages to deploy." }, { status: 400 });
    }

    const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const files: Array<{ remotePath: string; content: string; slug: string }> = [];
    const fetchErrors: Array<{ slug: string; error: string }> = [];

    for (const page of publishedPages) {
      try {
        const url =
          page.slug === "home" || page.slug === "/"
            ? `${baseUrl}/?tenant=${tenantSlug}`
            : `${baseUrl}/${page.slug}?tenant=${tenantSlug}`;

        const res = await fetch(url, {
          headers: { Accept: "text/html" },
          // 10s timeout per page
          signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
          fetchErrors.push({ slug: page.slug, error: `HTTP ${res.status}` });
          continue;
        }

        const rawHtml = await res.text();
        const html = absolutifyHtml(rawHtml, baseUrl);

        const remotePath =
          page.slug === "home" || page.slug === "/"
            ? `${config.remotePath}/index.html`
            : `${config.remotePath}/${page.slug}/index.html`;

        files.push({ remotePath, content: html, slug: page.slug });
      } catch (err: unknown) {
        fetchErrors.push({
          slug: page.slug,
          error: err instanceof Error ? err.message : "Fetch failed",
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json({
        error: "Could not render any pages.",
        fetchErrors,
      }, { status: 500 });
    }

    const { uploaded, errors: uploadErrors } = await uploadToFTP(config, files);

    return NextResponse.json({
      deployed: uploaded.length,
      total: publishedPages.length,
      uploaded,
      uploadErrors,
      fetchErrors,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
