import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages } from "@/lib/pageService";
import { PageRenderer } from "@/renderer/PageRenderer";
import type { PageDocument } from "@/types/page";
import type { Metadata } from "next";

export const revalidate = 60;

interface Params { slug: string[] }

async function getTenant() {
  const hdrs = await headers();
  return hdrs.get("x-tenant-slug") ?? "default";
}

export async function generateStaticParams() {
  // Can't know tenant at build time in multi-tenant setup — skip SSG
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tenantSlug = await getTenant();
  const pageSlug = slug.join("/");
  const page = await getPageBySlug(tenantSlug, pageSlug);
  if (!page) return {};
  const doc = JSON.parse(page.content) as PageDocument;
  return {
    title: doc.meta.title,
    description: doc.meta.description,
    openGraph: doc.meta.ogImage ? { images: [doc.meta.ogImage] } : {},
  };
}

export default async function SlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tenantSlug = await getTenant();
  const pageSlug = slug.join("/");
  const page = await getPageBySlug(tenantSlug, pageSlug);

  if (!page || page.status !== "published") notFound();

  const document = JSON.parse(page.content) as PageDocument;
  if (!document.settings?.headerVisible === false) {
    // header/footer handled by layout
  }
  return <PageRenderer document={document} />;
}
