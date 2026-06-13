"use client";

import { useUIStore } from "@/builder/store/uiStore";
import { CanvasColumn } from "./CanvasColumn";
import { SectionToolbar } from "./SectionToolbar";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/page";

interface CanvasSectionProps {
  section: Section;
  index: number;
  total: number;
}

export function CanvasSection({ section, index, total }: CanvasSectionProps) {
  const { selectedNodeId, selectNode } = useUIStore();
  const isSelected = selectedNodeId === section.id;

  const bg = section.backgroundType === "color" && section.backgroundValue
    ? { backgroundColor: section.backgroundValue }
    : {};

  return (
    <div
      className={cn("relative group mt-4", isSelected && "ring-2 ring-blue-400")}
      style={bg}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(section.id, "section");
      }}
    >
      <SectionToolbar section={section} index={index} total={total} />
      <div className="px-4 py-6 grid grid-cols-12 gap-4">
        {section.columns.map((col) => (
          <CanvasColumn
            key={col.id}
            column={col}
            sectionId={section.id}
            span={col.span}
          />
        ))}
      </div>
    </div>
  );
}
