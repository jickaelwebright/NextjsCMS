"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { DividerBlock } from "@/types/page";

const STYLES = ["solid", "dashed", "dotted", "none"] as const;

export function DividerProperties({ block }: { block: DividerBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Style</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.style ?? "solid"}
          onChange={(e) => updateBlock(block.id, { style: e.target.value as DividerBlock["props"]["style"] })}
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            className="h-8 w-10 cursor-pointer rounded border"
            value={p.color ?? "#e5e7eb"}
            onChange={(e) => updateBlock(block.id, { color: e.target.value })}
          />
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1.5 text-sm font-mono"
            value={p.color ?? "#e5e7eb"}
            onChange={(e) => updateBlock(block.id, { color: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Thickness (px)</label>
        <input
          type="number"
          min={1}
          max={20}
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.thickness ?? 1}
          onChange={(e) => updateBlock(block.id, { thickness: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Width (%)</label>
        <input
          type="number"
          min={10}
          max={100}
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.width ?? 100}
          onChange={(e) => updateBlock(block.id, { width: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
