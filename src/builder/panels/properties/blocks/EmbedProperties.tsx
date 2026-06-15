"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { EmbedBlock } from "@/types/page";

export function EmbedProperties({ block }: { block: EmbedBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Embed URL</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.src}
          onChange={(e) => updateBlock(block.id, { src: e.target.value })}
          placeholder="https://..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Works with: Google Maps, Calendly, Typeform, Airtable, YouTube, etc.
        </p>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Height</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.height ?? "450px"}
          onChange={(e) => updateBlock(block.id, { height: e.target.value })}
          placeholder="450px"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Title (accessibility)</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.title ?? ""}
          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
          placeholder="Embedded content"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="rounded"
          checked={p.scrolling ?? false}
          onChange={(e) => updateBlock(block.id, { scrolling: e.target.checked })}
        />
        <span className="text-sm text-gray-700">Allow scrolling</span>
      </label>
    </div>
  );
}
