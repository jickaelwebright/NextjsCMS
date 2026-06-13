"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { CanvasSection } from "./CanvasSection";
import { createSection } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const widthClass: Record<string, string> = {
  mobile:  "max-w-[390px]",
  tablet:  "max-w-[768px]",
  desktop: "max-w-full",
};

export function BuilderCanvas() {
  const { document, addSection } = useBuilderStore();
  const { previewDevice, clearSelection } = useUIStore();

  if (!document) return <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>;

  const sections = document.sections;

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-100 p-6"
      onClick={clearSelection}
    >
      <div
        className={cn(
          "mx-auto bg-white min-h-[600px] shadow-lg rounded transition-all duration-300 builder-canvas",
          widthClass[previewDevice]
        )}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-3">
            <PlusCircle size={40} className="opacity-30" />
            <p className="text-sm">Drag a widget from the left panel, or add a section</p>
            <button
              onClick={(e) => { e.stopPropagation(); addSection(createSection("1")); }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Add Section
            </button>
          </div>
        ) : (
          <>
            {sections.map((section, i) => (
              <CanvasSection key={section.id} section={section} index={i} total={sections.length} />
            ))}
            <div className="flex justify-center py-4">
              <button
                onClick={(e) => { e.stopPropagation(); addSection(createSection("1")); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <PlusCircle size={16} /> Add Section
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
