"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { CardBlock } from "@/types/page";

export function CardProperties({ block }: { block: CardBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Image URL</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.image ?? ""}
          onChange={(e) => updateBlock(block.id, { image: e.target.value })} placeholder="/uploads/..." />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Heading</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.heading}
          onChange={(e) => updateBlock(block.id, { heading: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Body</label>
        <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={3} value={p.body}
          onChange={(e) => updateBlock(block.id, { body: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">CTA Label</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.ctaLabel ?? ""}
          onChange={(e) => updateBlock(block.id, { ctaLabel: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">CTA Link</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.ctaHref ?? ""}
          onChange={(e) => updateBlock(block.id, { ctaHref: e.target.value })} placeholder="https://" />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Variant</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.variant ?? "default"}
          onChange={(e) => updateBlock(block.id, { variant: e.target.value as any })}>
          <option value="default">Default</option>
          <option value="outlined">Outlined</option>
          <option value="elevated">Elevated</option>
        </select>
      </div>
    </div>
  );
}
