import { styleToInline } from "@/lib/utils";
import type { DividerBlock } from "@/types/page";

export function DividerRenderer({ block }: { block: DividerBlock }) {
  const p = block.props;
  const style: React.CSSProperties = {
    borderTopStyle: (p.style ?? "solid") as any,
    borderTopColor: p.color ?? "#e5e7eb",
    borderTopWidth: `${p.thickness ?? 1}px`,
    width: p.width ? `${p.width}%` : "100%",
    margin: "0 auto",
    ...styleToInline(block.styles?.desktop),
  };
  return <hr style={style} />;
}
