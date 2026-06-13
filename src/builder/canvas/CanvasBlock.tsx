"use client";

import { useDraggable } from "@dnd-kit/core";
import { useUIStore } from "@/builder/store/uiStore";
import { BlockRenderer } from "@/renderer/BlockRenderer";
import { InlineBlockEditor } from "./InlineBlockEditor";
import { BlockToolbar } from "./BlockToolbar";
import { cn } from "@/lib/utils";
import type { Block, TextBlock, HeadingBlock } from "@/types/page";
import type { DragData } from "@/types/builder";

interface CanvasBlockProps {
  block: Block;
  sectionId: string;
  columnId: string;
}

export function CanvasBlock({ block, sectionId, columnId }: CanvasBlockProps) {
  const { selectedNodeId, selectNode, editingBlockId, setEditingBlock } = useUIStore();
  const isSelected = selectedNodeId === block.id;
  const isEditing = editingBlockId === block.id;
  const isTextBlock = block.type === "text" || block.type === "heading";

  const dragData: DragData = {
    type: "EXISTING_BLOCK",
    blockId: block.id,
    sourceSectionId: sectionId,
    sourceColumnId: columnId,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: dragData,
    disabled: isEditing,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative group",
        isSelected && !isEditing && "ring-2 ring-indigo-500 ring-offset-1",
        isEditing && "ring-2 ring-indigo-400 ring-offset-1",
        isDragging && "opacity-30"
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing) selectNode(block.id, "block");
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isTextBlock) {
          selectNode(block.id, "block");
          setEditingBlock(block.id);
        }
      }}
    >
      {isSelected && !isEditing && (
        <BlockToolbar block={block} sectionId={sectionId} columnId={columnId} />
      )}
      {/* Drag handle — only on selected, non-editing block */}
      {isSelected && !isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-0 right-0 p-1 cursor-grab active:cursor-grabbing z-20"
        />
      )}

      {isEditing && isTextBlock ? (
        <InlineBlockEditor block={block as TextBlock | HeadingBlock} />
      ) : (
        <div className={cn("pointer-events-none", isSelected && "pointer-events-auto")}>
          <BlockRenderer block={block} />
        </div>
      )}
    </div>
  );
}
