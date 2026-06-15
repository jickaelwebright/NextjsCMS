"use client";

import { useDraggable } from "@dnd-kit/core";
import { useUIStore } from "@/builder/store/uiStore";
import { BlockRenderer } from "@/renderer/BlockRenderer";
import { InlineBlockEditor } from "./InlineBlockEditor";
import { BlockToolbar } from "./BlockToolbar";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
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
        if (isEditing) return;
        if (isSelected && isTextBlock) {
          setEditingBlock(block.id);
        } else {
          selectNode(block.id, "block");
        }
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
      {isSelected && !isEditing && isTextBlock && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-0.5 z-10 pointer-events-none">
          <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-t-sm opacity-80">
            click to edit text
          </span>
        </div>
      )}
      {/* Drag handle — only on selected, non-editing block */}
      {isSelected && !isEditing && (
        <div
          {...attributes}
          {...listeners}
          title="Drag to move"
          className="absolute top-0 right-6 flex items-center justify-center w-6 h-6 bg-indigo-500 text-white rounded-bl cursor-grab active:cursor-grabbing z-20"
        >
          <GripVertical size={12} />
        </div>
      )}

      {isEditing && isTextBlock ? (
        <InlineBlockEditor block={block as TextBlock | HeadingBlock} />
      ) : (
        <div className={cn("pointer-events-none", isSelected && "pointer-events-auto")}>
          <BlockRenderer block={block} isBuilder />
        </div>
      )}
    </div>
  );
}
