import { SectionRenderer } from "./SectionRenderer";
import type { PageDocument } from "@/types/page";

interface PageRendererProps {
  document: PageDocument;
}

export function PageRenderer({ document }: PageRendererProps) {
  const fontFamily = document.settings?.globalFontFamily;
  return (
    <main style={fontFamily ? { fontFamily } : {}}>
      {document.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}
