"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { ColorPicker } from "../shared/ColorPicker";
import { cn } from "@/lib/utils";
import type { Section, ColumnLayout } from "@/types/page";

const LAYOUTS: { value: ColumnLayout; spans: number[] }[] = [
  { value: "1",                   spans: [12] },
  { value: "1/2+1/2",             spans: [6, 6] },
  { value: "1/3+2/3",             spans: [4, 8] },
  { value: "2/3+1/3",             spans: [8, 4] },
  { value: "1/3+1/3+1/3",         spans: [4, 4, 4] },
  { value: "1/4+1/4+1/4+1/4",     spans: [3, 3, 3, 3] },
];

const WIDTHS = ["sm","md","lg","xl","2xl","full"] as const;

export function SectionProperties({ section }: { section: Section }) {
  const { updateSection } = useBuilderStore();

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Label</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm"
          value={section.label ?? ""}
          onChange={(e) => updateSection(section.id, { label: e.target.value })}
          placeholder="Section name" />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Section ID (anchor link)</label>
        <div className="flex items-center border rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-400">
          <span className="px-2 py-1.5 text-sm text-gray-400 bg-gray-50 border-r select-none">#</span>
          <input
            className="flex-1 px-2 py-1.5 text-sm focus:outline-none"
            value={section.anchorId ?? ""}
            onChange={(e) => updateSection(section.id, { anchorId: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            placeholder="pricing, contact, hero…" />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Link to this section with <code className="bg-gray-100 px-0.5 rounded">/#section-id</code></p>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-2">Column Layout</label>
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUTS.map(({ value, spans }) => (
            <button
              key={value}
              onClick={() => updateSection(section.id, { columnLayout: value })}
              title={value}
              className={cn(
                "flex gap-0.5 items-stretch h-8 p-1.5 rounded border transition-colors",
                section.columnLayout === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              {spans.map((span, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-sm",
                    section.columnLayout === value ? "bg-blue-400" : "bg-gray-300"
                  )}
                  style={{ flex: span }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Container Width</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm"
          value={section.containerWidth ?? "xl"}
          onChange={(e) => updateSection(section.id, { containerWidth: e.target.value as any })}>
          {WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Background Type</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm"
          value={section.backgroundType ?? ""}
          onChange={(e) => updateSection(section.id, { backgroundType: e.target.value as any || undefined })}>
          <option value="">None</option>
          <option value="color">Color</option>
          <option value="image">Image</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
      {section.backgroundType === "color" && (
        <ColorPicker
          label="Background Color"
          value={section.backgroundValue}
          onChange={(v) => updateSection(section.id, { backgroundValue: v })}
        />
      )}
      {(section.backgroundType === "image" || section.backgroundType === "gradient") && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            {section.backgroundType === "image" ? "Image URL" : "Gradient CSS"}
          </label>
          <input className="w-full border rounded px-2 py-1.5 text-sm"
            value={section.backgroundValue ?? ""}
            onChange={(e) => updateSection(section.id, { backgroundValue: e.target.value })}
            placeholder={section.backgroundType === "image" ? "/uploads/..." : "linear-gradient(...)"} />
        </div>
      )}
    </div>
  );
}
