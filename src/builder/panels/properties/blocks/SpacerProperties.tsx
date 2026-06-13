"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { SpacerBlock } from "@/types/page";

export function SpacerProperties({ block }: { block: SpacerBlock }) {
  const { updateBlock } = useBuilderStore();
  return (
    <div className="p-3">
      <label className="text-xs text-gray-600 block mb-1">Height (px)</label>
      <input
        type="number"
        min={8}
        max={400}
        className="w-full border rounded px-2 py-1.5 text-sm"
        value={block.props.height}
        onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) })}
      />
    </div>
  );
}
