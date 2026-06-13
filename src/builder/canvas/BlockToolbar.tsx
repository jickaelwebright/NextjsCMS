"use client";

import { Copy, Trash2, GripVertical } from "lucide-react";
import { useBuilderStore } from "@/builder/store/builderStore";
import type { Block } from "@/types/page";

interface BlockToolbarProps {
  block: Block;
  sectionId: string;
  columnId: string;
}

export function BlockToolbar({ block }: BlockToolbarProps) {
  const { duplicateBlock, deleteBlock } = useBuilderStore();

  return (
    <div className="absolute -top-7 left-0 flex items-center gap-1 bg-indigo-600 text-white text-xs rounded-t px-2 py-1 z-30">
      <GripVertical size={12} className="cursor-grab active:cursor-grabbing" />
      <span className="capitalize mr-1">{block.type}</span>
      <button
        onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
        className="p-0.5 hover:bg-indigo-700 rounded"
        title="Duplicate"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
        className="p-0.5 hover:bg-red-600 rounded"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
