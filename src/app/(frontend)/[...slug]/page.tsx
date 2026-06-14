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

  // Blog posts get a dedicated header with title and date
  if (page.pageType === "post") {
    const publishedDate = page.publishedAt
      ? new Date(typeof page.publishedAt === "number" ? page.publishedAt * 1000 : page.publishedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
      : null;
    return (
      <article>
        {document.meta.ogImage && (
          <div className="w-full max-h-80 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={document.meta.ogImage} alt={document.meta.title} className="w-full h-80 object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-4">
          <div className="mb-2">
            <a href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</a>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{document.meta.title}</h1>
          {publishedDate && <time className="text-sm text-gray-400">{publishedDate}</time>}
          {document.meta.description && (
            <p className="text-lg text-gray-600 mt-3 mb-8 border-l-4 border-blue-200 pl-4">{document.meta.description}</p>
          )}
        </div>
        <PageRenderer document={document} />
      </article>
    );
  }

  return <PageRenderer document={document} />;
}
