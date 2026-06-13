import { BlockRenderer } from "./BlockRenderer";
import { styleToInline } from "@/lib/utils";
import type { Column } from "@/types/page";

const spanClass: Record<number, string> = {
  3: "col-span-3", 4: "col-span-4", 6: "col-span-6",
  8: "col-span-8", 9: "col-span-9", 12: "col-span-12",
};

interface ColumnRendererProps {
  column: Column;
}

export function ColumnRenderer({ column }: ColumnRendererProps) {
  const style = styleToInline(column.styles?.desktop);
  return (
    <div className={`${spanClass[column.span] ?? "col-span-12"} flex flex-col gap-4`} style={style}>
      {column.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
