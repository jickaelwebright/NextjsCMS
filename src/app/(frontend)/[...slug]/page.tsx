import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPageById, getPageBySlug, getPublishedPages } from "@/lib/pageService";
import { getTenantDb } from "@/db/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { PageRenderer } from "@/renderer/PageRenderer";
import { JsonLd } from "@/components/JsonLd";
import type { PageDocument } from "@/types/page";
import type { Metadata } from "next";

export const revalidate = 60;

interface Params { slug: string[] }

async function getTenant() {
  const hdrs = await headers();
  return hdrs.get("x-tenant-slug") ?? "default";
}

async function getSiteSettings(tenantSlug: string): Promise<Record<string, string>> {
  try {
    const db = getTenantDb(tenantSlug);
    const rows = await db.select().from(siteSettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch { return {}; }
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tenantSlug = await getTenant();
  const pageSlug = slug.join("/");
  const page = await getPageBySlug(tenantSlug, pageSlug);
  if (!page) return {};

  const doc = JSON.parse(page.content) as PageDocument;
  const site = await getSiteSettings(tenantSlug);

  const siteUrl = (site.site_url ?? "").replace(/\/$/, "");
  const siteName = site.siteName ?? site.org_name ?? tenantSlug;
  const canonical = doc.meta.canonicalUrl
    ? doc.meta.canonicalUrl
    : siteUrl ? `${siteUrl}/${pageSlug}` : undefined;

  const ogImage = doc.meta.ogImage
    ? (doc.meta.ogImage.startsWith("http") ? doc.meta.ogImage : siteUrl + doc.meta.ogImage)
    : undefined;

  const isPost = page.pageType === "post";
  const publishedAt = page.publishedAt
    ? new Date(typeof page.publishedAt === "number" ? page.publishedAt * 1000 : page.publishedAt).toISOString()
    : undefined;
  const updatedAt = page.updatedAt
    ? new Date(typeof page.updatedAt === "number" ? page.updatedAt * 1000 : page.updatedAt).toISOString()
    : undefined;

  return {
    title: doc.meta.title,
    description: doc.meta.description,
    ...(doc.meta.noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: doc.meta.title,
      description: doc.meta.description,
      siteName,
      locale: "en_AU",
      type: isPost ? "article" : "website",
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(isPost && publishedAt ? { publishedTime: publishedAt } : {}),
      ...(isPost && updatedAt ? { modifiedTime: updatedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: doc.meta.title,
      description: doc.meta.description,
      ...(doc.meta.twitterImage || ogImage ? { images: [doc.meta.twitterImage ?? ogImage ?? ""] } : {}),
    },
  };
}

export default async function SlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tenantSlug = await getTenant();
  const pageSlug = slug.join("/");
  const page = await getPageBySlug(tenantSlug, pageSlug);

  if (!page || page.status !== "published") notFound();

  const doc = JSON.parse(page.content) as PageDocument;
  const site = await getSiteSettings(tenantSlug);
  const siteUrl = (site.site_url ?? "").replace(/\/$/, "");
  const siteName = site.siteName ?? site.org_name ?? tenantSlug;
  const pageUrl = siteUrl ? `${siteUrl}/${pageSlug}` : `/${pageSlug}`;

  const isPost = page.pageType === "post";
  const publishedAt = page.publishedAt
    ? new Date(typeof page.publishedAt === "number" ? page.publishedAt * 1000 : page.publishedAt).toISOString()
    : undefined;
  const updatedAt = page.updatedAt
    ? new Date(typeof page.updatedAt === "number" ? page.updatedAt * 1000 : page.updatedAt).toISOString()
    : undefined;

  const jsonLd = isPost
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: doc.meta.title,
        description: doc.meta.description,
        url: pageUrl,
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(updatedAt ? { dateModified: updatedAt } : {}),
        ...(doc.meta.ogImage ? { image: doc.meta.ogImage.startsWith("http") ? doc.meta.ogImage : siteUrl + doc.meta.ogImage } : {}),
        publisher: { "@type": "Organization", name: siteName, ...(site.org_logo_url ? { logo: { "@type": "ImageObject", url: site.org_logo_url } } : {}) },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: doc.meta.title,
        description: doc.meta.description,
        url: pageUrl,
        ...(updatedAt ? { dateModified: updatedAt } : {}),
      };

  const breadcrumbLd = isPost
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl || "/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: siteUrl ? `${siteUrl}/blog` : "/blog" },
          { "@type": "ListItem", position: 3, name: doc.meta.title, item: pageUrl },
        ],
      }
    : null;

  // Blog post dedicated layout
  if (isPost) {
    const dateStr = publishedAt
      ? new Date(publishedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
      : null;
    return (
      <>
        <JsonLd data={jsonLd} />
        {breadcrumbLd && <JsonLd data={breadcrumbLd} />}
        <article>
          {doc.meta.ogImage && (
            <div className="w-full max-h-80 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={doc.meta.ogImage} alt={doc.meta.title} className="w-full h-80 object-cover" />
            </div>
          )}
          <div className="max-w-3xl mx-auto px-6 pt-10 pb-4">
            <div className="mb-2">
              <a href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</a>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{doc.meta.title}</h1>
            {dateStr && <time className="text-sm text-gray-400" dateTime={publishedAt}>{dateStr}</time>}
            {doc.meta.description && (
              <p className="text-lg text-gray-600 mt-3 mb-8 border-l-4 border-blue-200 pl-4">{doc.meta.description}</p>
            )}
          </div>
          <PageRenderer document={doc} />
        </article>
      </>
    );
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageRenderer document={doc} />
    </>
  );
}
