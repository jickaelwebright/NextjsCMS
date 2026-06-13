"use client";

import { useDroppable } from "@dnd-kit/core";
import { useUIStore } from "@/builder/store/uiStore";
import { CanvasBlock } from "./CanvasBlock";
import { cn } from "@/lib/utils";
import type { Column } from "@/types/page";

interface CanvasColumnProps {
  column: Column;
  sectionId: string;
  span: number;
}

const spanClass: Record<number, string> = {
  3: "col-span-3",
  4: "col-span-4",
  6: "col-span-6",
  8: "col-span-8",
  9: "col-span-9",
  12: "col-span-12",
};

export function CanvasColumn({ column, sectionId, span }: CanvasColumnProps) {
  const dropId = `column:${sectionId}:${column.id}`;
  const { dragOverColumnId } = useUIStore();
  const isOver = dragOverColumnId?.startsWith(dropId) ?? false;

  const { setNodeRef } = useDroppable({ id: dropId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        spanClass[span] ?? "col-span-12",
        "min-h-[80px] transition-colors rounded",
        isOver && "bg-blue-50 ring-2 ring-blue-300 ring-dashed"
      )}
    >
      {column.blocks.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded">
          Drop block here
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {column.blocks.map((block) => (
            <CanvasBlock
              key={block.id}
              block={block}
              sectionId={sectionId}
              columnId={column.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
