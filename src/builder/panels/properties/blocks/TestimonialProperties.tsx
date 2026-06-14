"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { TestimonialBlock } from "@/types/page";

export function TestimonialProperties({ block }: { block: TestimonialBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Quote</label>
        <textarea
          rows={4}
          className="w-full border rounded px-2 py-1.5 text-sm resize-none"
          value={p.quote}
          onChange={(e) => updateBlock(block.id, { quote: e.target.value })}
          placeholder="The best product I've ever used..."
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Author Name</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.authorName}
          onChange={(e) => updateBlock(block.id, { authorName: e.target.value })}
          placeholder="Jane Smith"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Role / Title</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.authorRole ?? ""}
          onChange={(e) => updateBlock(block.id, { authorRole: e.target.value })}
          placeholder="CEO"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Company</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.authorCompany ?? ""}
          onChange={(e) => updateBlock(block.id, { authorCompany: e.target.value })}
          placeholder="Acme Corp"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Avatar URL</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.avatarUrl ?? ""}
          onChange={(e) => updateBlock(block.id, { avatarUrl: e.target.value })}
          placeholder="/uploads/tenant/avatar.webp"
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Star Rating (0 = hidden)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            className="flex-1"
            value={p.rating ?? 5}
            onChange={(e) => updateBlock(block.id, { rating: Number(e.target.value) })}
          />
          <span className="text-sm font-medium w-4 text-center">{p.rating ?? 5}</span>
        </div>
      </div>
    </div>
  );
}
