"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { ColorPicker } from "../shared/ColorPicker";
import { ImageIcon } from "lucide-react";
import type { HeroBlock } from "@/types/page";

export function HeroProperties({ block }: { block: HeroBlock }) {
  const { updateBlock } = useBuilderStore();
  const { openMediaPicker } = useUIStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Heading</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.heading}
          onChange={(e) => updateBlock(block.id, { heading: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Subheading</label>
        <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} value={p.subheading ?? ""}
          onChange={(e) => updateBlock(block.id, { subheading: e.target.value })} />
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
        <label className="text-xs text-gray-600 block mb-1">Background Image</label>
        <button
          onClick={() => openMediaPicker(block.id, "backgroundImage")}
          className="w-full flex items-center gap-2 border rounded px-2 py-1.5 text-sm hover:bg-gray-50 text-gray-700 mb-1"
        >
          <ImageIcon size={14} className="text-gray-400" />
          {p.backgroundImage ? "Change image" : "Choose from library"}
        </button>
        <input
          className="w-full border rounded px-2 py-1 text-xs text-gray-500"
          value={p.backgroundImage ?? ""}
          onChange={(e) => updateBlock(block.id, { backgroundImage: e.target.value })}
          placeholder="or paste URL..."
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Overlay Opacity ({p.backgroundOverlay ?? 0}%)</label>
        <input type="range" min={0} max={90} step={5} value={p.backgroundOverlay ?? 0}
          className="w-full"
          onChange={(e) => updateBlock(block.id, { backgroundOverlay: Number(e.target.value) })} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Min Height</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm" value={p.minHeight ?? "60vh"}
          onChange={(e) => updateBlock(block.id, { minHeight: e.target.value })} placeholder="60vh" />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Alignment</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm" value={p.align ?? "center"}
          onChange={(e) => updateBlock(block.id, { align: e.target.value as any })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <ColorPicker label="Text Color" value={p.textColor} onChange={(v) => updateBlock(block.id, { textColor: v })} />
    </div>
  );
}
