import { styleToInline } from "@/lib/utils";
import type { TextBlock } from "@/types/page";

const fontSizeClass: Record<string, string> = {
  xs: "text-xs", sm: "text-sm", base: "text-base",
  lg: "text-lg", xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl",
};

export function TextRenderer({ block }: { block: TextBlock }) {
  const p = block.props;
  const alignClass = p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : p.align === "justify" ? "text-justify" : "text-left";
  const fsClass = fontSizeClass[p.fontSize ?? "base"] ?? "text-base";
  const style = { ...(p.color ? { color: p.color } : {}), ...styleToInline(block.styles?.desktop) };

  return (
    <div
      className={`prose max-w-none ${alignClass} ${fsClass}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: p.content }}
    />
  );
}
