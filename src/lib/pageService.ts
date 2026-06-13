import { getTenantDb } from "@/db/tenant";
import { pages } from "@/db/schema/tenant";
import { eq, desc } from "drizzle-orm";
import { generateId, createEmptyPage } from "./utils";
import { revalidatePath } from "next/cache";
import type { PageDocument } from "@/types/page";

export async function getPages(tenantSlug: string, type?: string) {
  const db = getTenantDb(tenantSlug);
  const q = db.select().from(pages).orderBy(desc(pages.updatedAt));
  return type ? (await q).filter((p) => p.pageType === type) : q;
}

export async function getPageById(tenantSlug: string, id: string) {
  const db = getTenantDb(tenantSlug);
  return db.select().from(pages).where(eq(pages.id, id)).get();
}

export async function getPageBySlug(tenantSlug: string, slug: string) {
  const db = getTenantDb(tenantSlug);
  return db.select().from(pages).where(eq(pages.slug, slug)).get();
}

export async function createPage(
  tenantSlug: string,
  data: { title: string; slug: string; pageType?: string }
) {
  const db = getTenantDb(tenantSlug);
  const id = generateId();
  const now = new Date();
  const doc = createEmptyPage(data.title, data.slug);
  await db.insert(pages).values({
    id,
    title: data.title,
    slug: data.slug,
    status: "draft",
    pageType: (data.pageType ?? "page") as any,
    content: JSON.stringify(doc),
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updatePageContent(
  tenantSlug: string,
  id: string,
  document: PageDocument
) {
  const db = getTenantDb(tenantSlug);
  await db
    .update(pages)
    .set({ content: JSON.stringify(document), updatedAt: new Date() })
    .where(eq(pages.id, id));
}

export async function publishPage(tenantSlug: string, id: string) {
  const db = getTenantDb(tenantSlug);
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (!page) throw new Error("Page not found");

  const newStatus = page.status === "published" ? "draft" : "published";
  await db
    .update(pages)
    .set({
      status: newStatus,
      publishedAt: newStatus === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id));

  if (newStatus === "published") {
    revalidatePath(`/${page.slug}`);
    revalidatePath(`/sites/${tenantSlug}/${page.slug}`);
  }

  return newStatus;
}

export async function deletePage(tenantSlug: string, id: string) {
  const db = getTenantDb(tenantSlug);
  await db.delete(pages).where(eq(pages.id, id));
}

export async function duplicatePage(tenantSlug: string, id: string) {
  const db = getTenantDb(tenantSlug);
  const original = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (!original) throw new Error("Page not found");

  const newId = generateId();
  const now = new Date();
  await db.insert(pages).values({
    id: newId,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    status: "draft",
    pageType: original.pageType,
    content: original.content,
    createdAt: now,
    updatedAt: now,
  });
  return newId;
}

export async function getPublishedPages(tenantSlug: string) {
  const db = getTenantDb(tenantSlug);
  return db
    .select({ slug: pages.slug, title: pages.title })
    .from(pages)
    .where(eq(pages.status, "published"));
}
