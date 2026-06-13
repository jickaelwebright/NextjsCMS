"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { ColorPicker } from "../shared/ColorPicker";
import type { TextBlock } from "@/types/page";

export function TextProperties({ block }: { block: TextBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Align</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.align ?? "left"}
          onChange={(e) => updateBlock(block.id, { align: e.target.value as any })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Font Size</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.fontSize ?? "base"}
          onChange={(e) => updateBlock(block.id, { fontSize: e.target.value })}
        >
          {["xs","sm","base","lg","xl","2xl","3xl"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <ColorPicker label="Color" value={p.color} onChange={(v) => updateBlock(block.id, { color: v })} />
      <p className="text-xs text-gray-400">Click on text in canvas to edit content inline.</p>
    </div>
  );
}
