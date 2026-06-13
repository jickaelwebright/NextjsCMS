"use client";

import { useDraggable } from "@dnd-kit/core";
import { useUIStore } from "@/builder/store/uiStore";
import { BlockRenderer } from "@/renderer/BlockRenderer";
import { BlockToolbar } from "./BlockToolbar";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/page";
import type { DragData } from "@/types/builder";

interface CanvasBlockProps {
  block: Block;
  sectionId: string;
  columnId: string;
}

export function CanvasBlock({ block, sectionId, columnId }: CanvasBlockProps) {
  const { selectedNodeId, selectNode } = useUIStore();
  const isSelected = selectedNodeId === block.id;

  const dragData: DragData = {
    type: "EXISTING_BLOCK",
    blockId: block.id,
    sourceSectionId: sectionId,
    sourceColumnId: columnId,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative group",
        isSelected && "ring-2 ring-indigo-500 ring-offset-1",
        isDragging && "opacity-30"
      )}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(block.id, "block");
      }}
    >
      {isSelected && (
        <BlockToolbar block={block} sectionId={sectionId} columnId={columnId} />
      )}
      {/* Drag handle — only on selected block */}
      {isSelected && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-0 right-0 p-1 cursor-grab active:cursor-grabbing z-20"
        />
      )}
      <div className={cn("pointer-events-none", isSelected && "pointer-events-auto")}>
        <BlockRenderer block={block} isEditing />
      </div>
    </div>
  );
}
