"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { ChevronRight, Eye, EyeOff, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/page";

function SectionLayer({ section, index }: { section: Section; index: number }) {
  const { updateSection } = useBuilderStore();
  const { selectedNodeId, selectNode } = useUIStore();
  const isSelected = selectedNodeId === section.id;

  return (
    <div className="mb-1">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 text-sm",
          isSelected && "bg-blue-50 text-blue-700"
        )}
        onClick={() => selectNode(section.id, "section")}
      >
        <ChevronRight size={12} className="text-gray-400" />
        <Layers size={14} />
        <span className="flex-1 truncate">{section.label ?? `Section ${index + 1}`}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateSection(section.id, { hidden: !section.hidden });
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          {section.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
      {section.columns.map((col, ci) => (
        <div key={col.id} className="ml-4 mt-0.5">
          <div className="text-xs text-gray-400 px-2 py-1">Column {ci + 1}</div>
          {col.blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                "ml-2 px-2 py-1 text-xs rounded cursor-pointer hover:bg-gray-100 flex items-center gap-1 capitalize",
                selectedNodeId === block.id && "bg-indigo-50 text-indigo-700"
              )}
              onClick={() => selectNode(block.id, "block")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {block.type}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function LayersTree() {
  const { document } = useBuilderStore();
  if (!document) return null;
  return (
    <div className="p-2">
      {document.sections.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No sections yet</p>
      ) : (
        document.sections.map((section, i) => (
          <SectionLayer key={section.id} section={section} index={i} />
        ))
      )}
    </div>
  );
}
