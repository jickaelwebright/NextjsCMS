"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { ColorPicker } from "../shared/ColorPicker";
import type { Section, ColumnLayout } from "@/types/page";

const LAYOUTS: { value: ColumnLayout; label: string }[] = [
  { value: "1",                   label: "1 Column" },
  { value: "1/2+1/2",             label: "2 Equal" },
  { value: "1/3+2/3",             label: "1/3 + 2/3" },
  { value: "2/3+1/3",             label: "2/3 + 1/3" },
  { value: "1/3+1/3+1/3",         label: "3 Equal" },
  { value: "1/4+1/4+1/4+1/4",     label: "4 Equal" },
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
        <label className="text-xs text-gray-600 block mb-1">Column Layout</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm"
          value={section.columnLayout}
          onChange={(e) => updateSection(section.id, { columnLayout: e.target.value as ColumnLayout })}>
          {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
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
