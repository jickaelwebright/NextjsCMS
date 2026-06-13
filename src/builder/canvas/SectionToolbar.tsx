"use client";

import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from "lucide-react";
import { useBuilderStore } from "@/builder/store/builderStore";
import { createSection } from "@/lib/utils";
import type { Section } from "@/types/page";

interface SectionToolbarProps {
  section: Section;
  index: number;
  total: number;
}

export function SectionToolbar({ section, index, total }: SectionToolbarProps) {
  const { moveSections, deleteSection, addSection } = useBuilderStore();

  return (
    <div className="absolute -top-8 left-0 flex items-center gap-1 bg-blue-600 text-white text-xs rounded-t px-2 py-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
      <GripVertical size={12} className="cursor-grab" />
      <span className="mr-1">{section.label ?? "Section"}</span>
      <button
        onClick={() => moveSections(index, index - 1)}
        disabled={index === 0}
        className="p-0.5 hover:bg-blue-700 rounded disabled:opacity-30"
        title="Move up"
      >
        <ArrowUp size={12} />
      </button>
      <button
        onClick={() => moveSections(index, index + 1)}
        disabled={index === total - 1}
        className="p-0.5 hover:bg-blue-700 rounded disabled:opacity-30"
        title="Move down"
      >
        <ArrowDown size={12} />
      </button>
      <button
        onClick={() => {
          const clone = createSection(section.columnLayout);
          addSection(clone, index + 1);
        }}
        className="p-0.5 hover:bg-blue-700 rounded"
        title="Duplicate section"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={() => deleteSection(section.id)}
        className="p-0.5 hover:bg-red-600 rounded"
        title="Delete section"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
