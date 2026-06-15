"use client";

import { BuilderApp } from "@/builder/BuilderApp";
import type { PageDocument } from "@/types/page";

interface BuilderPageClientProps {
  pageId: string;
  pageTitle: string;
  initialDocument: PageDocument;
  tenantSlug: string;
}

export function BuilderPageClient({ pageId, pageTitle, initialDocument, tenantSlug }: BuilderPageClientProps) {
  return <BuilderApp pageId={pageId} pageTitle={pageTitle} initialDocument={initialDocument} tenantSlug={tenantSlug} />;
}
