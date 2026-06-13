"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { ColorPicker } from "../shared/ColorPicker";
import type { HeadingBlock } from "@/types/page";

export function HeadingProperties({ block }: { block: HeadingBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Text</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Level</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.level}
          onChange={(e) => updateBlock(block.id, { level: Number(e.target.value) as any })}
        >
          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>H{n}</option>)}
        </select>
      </div>
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
        </select>
      </div>
      <ColorPicker label="Color" value={p.color} onChange={(v) => updateBlock(block.id, { color: v })} />
    </div>
  );
}
