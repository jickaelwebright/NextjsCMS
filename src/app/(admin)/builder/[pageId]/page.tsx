import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPageById } from "@/lib/pageService";
import { BuilderPageClient } from "./BuilderPageClient";
import type { PageDocument } from "@/types/page";
import { createEmptyPage } from "@/lib/utils";

export default async function BuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const tenantSlug = (session.user as any).tenantSlug as string;

  // Support global-header and global-footer special pages
  if (pageId === "global-header" || pageId === "global-footer") {
    const region = pageId.replace("global-", "") as "header" | "footer";
    const emptyDoc = createEmptyPage(region === "header" ? "Header" : "Footer", `__${region}__`);
    return (
      <BuilderPageClient
        pageId={pageId}
        pageTitle={region === "header" ? "Header Editor" : "Footer Editor"}
        initialDocument={emptyDoc}
        tenantSlug={tenantSlug}
      />
    );
  }

  const page = await getPageById(tenantSlug, pageId);
  if (!page) notFound();

  let document: PageDocument;
  try {
    document = JSON.parse(page.content) as PageDocument;
    if (!document.sections) document = createEmptyPage(page.title, page.slug);
  } catch {
    document = createEmptyPage(page.title, page.slug);
  }

  return (
    <BuilderPageClient
      pageId={pageId}
      pageTitle={page.title}
      initialDocument={document}
      tenantSlug={tenantSlug}
    />
  );
}
