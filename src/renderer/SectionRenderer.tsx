import { ColumnRenderer } from "./ColumnRenderer";
import { styleToInline } from "@/lib/utils";
import type { Section } from "@/types/page";

const containerWidth: Record<string, string> = {
  sm: "max-w-screen-sm", md: "max-w-screen-md", lg: "max-w-screen-lg",
  xl: "max-w-screen-xl", "2xl": "max-w-screen-2xl", full: "w-full",
};

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  if (section.hidden) return null;

  const outerStyle: React.CSSProperties = {
    ...styleToInline(section.styles?.desktop),
  };

  if (section.backgroundType === "color" && section.backgroundValue) {
    outerStyle.backgroundColor = section.backgroundValue;
  } else if (section.backgroundType === "image" && section.backgroundValue) {
    outerStyle.backgroundImage = `url(${section.backgroundValue})`;
    outerStyle.backgroundSize = "cover";
    outerStyle.backgroundPosition = "center";
  } else if (section.backgroundType === "gradient" && section.backgroundValue) {
    outerStyle.backgroundImage = section.backgroundValue;
  }

  const maxWClass = containerWidth[section.containerWidth ?? "xl"] ?? "max-w-screen-xl";

  return (
    <section style={outerStyle} className="relative w-full">
      {(section.backgroundOverlay ?? 0) > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: (section.backgroundOverlay ?? 0) / 100 }}
        />
      )}
      <div className={`relative ${maxWClass} mx-auto px-6 py-12 grid grid-cols-12 gap-6`}>
        {section.columns.map((col) => (
          <ColumnRenderer key={col.id} column={col} />
        ))}
      </div>
    </section>
  );
}
