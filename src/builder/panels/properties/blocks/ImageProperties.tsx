"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { ImageIcon } from "lucide-react";
import type { ImageBlock } from "@/types/page";

export function ImageProperties({ block }: { block: ImageBlock }) {
  const { updateBlock } = useBuilderStore();
  const { openMediaPicker } = useUIStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Image</label>
        <button
          onClick={() => openMediaPicker(block.id, "src")}
          className="w-full flex items-center gap-2 border rounded px-2 py-1.5 text-sm hover:bg-gray-50 text-gray-700"
        >
          <ImageIcon size={14} className="text-gray-400" />
          {p.src ? "Change image" : "Choose from library"}
        </button>
        {p.src && (
          <div className="mt-1.5 rounded overflow-hidden border border-gray-200 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
          </div>
        )}
        <input
          className="mt-1 w-full border rounded px-2 py-1 text-xs text-gray-500"
          value={p.src}
          onChange={(e) => updateBlock(block.id, { src: e.target.value })}
          placeholder="or paste URL..."
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
          onChange={(e) => updateBlock(block.id, { objectFit: e.target.value as "cover" | "contain" | "fill" })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>
    </div>
  );
}
