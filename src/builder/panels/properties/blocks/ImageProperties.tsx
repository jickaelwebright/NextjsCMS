"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { ImageBlock } from "@/types/page";

export function ImageProperties({ block }: { block: ImageBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Image URL</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.src}
          onChange={(e) => updateBlock(block.id, { src: e.target.value })}
          placeholder="/uploads/..."
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Alt Text</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.alt}
          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Link (optional)</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.href ?? ""}
          onChange={(e) => updateBlock(block.id, { href: e.target.value })}
          placeholder="https://"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Object Fit</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.objectFit ?? "cover"}
          onChange={(e) => updateBlock(block.id, { objectFit: e.target.value as any })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>
    </div>
  );
}
