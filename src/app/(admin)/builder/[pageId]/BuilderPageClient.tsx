"use client";

import { BuilderApp } from "@/builder/BuilderApp";
import type { PageDocument } from "@/types/page";

interface BuilderPageClientProps {
  pageId: string;
  pageTitle: string;
  initialDocument: PageDocument;
}

export function BuilderPageClient({ pageId, pageTitle, initialDocument }: BuilderPageClientProps) {
  return <BuilderApp pageId={pageId} pageTitle={pageTitle} initialDocument={initialDocument} />;
}
