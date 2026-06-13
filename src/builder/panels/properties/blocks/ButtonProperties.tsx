"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { ButtonBlock } from "@/types/page";

export function ButtonProperties({ block }: { block: ButtonBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Label</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.label}
          onChange={(e) => updateBlock(block.id, { label: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">URL</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.href}
          onChange={(e) => updateBlock(block.id, { href: e.target.value })} placeholder="https://" />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Variant</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.variant ?? "primary"}
          onChange={(e) => updateBlock(block.id, { variant: e.target.value as any })}>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Size</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.size ?? "md"}
          onChange={(e) => updateBlock(block.id, { size: e.target.value as any })}>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Align</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.align ?? "left"}
          onChange={(e) => updateBlock(block.id, { align: e.target.value as any })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={p.openInNewTab ?? false}
          onChange={(e) => updateBlock(block.id, { openInNewTab: e.target.checked })} />
        Open in new tab
      </label>
    </div>
  );
}
