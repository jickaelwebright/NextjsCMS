"use client";

import { useState } from "react";
import { useBuilderStore } from "@/builder/store/builderStore";
import { generateId } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronUp, Star } from "lucide-react";
import type { PricingTableBlock, PricingTier } from "@/types/page";

function TierEditor({
  tier,
  index,
  onChange,
  onDelete,
  onMove,
  total,
}: {
  tier: PricingTier;
  index: number;
  onChange: (t: PricingTier) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  total: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const field = (k: keyof PricingTier, v: unknown) => onChange({ ...tier, [k]: v });

  return (
    <div className={`border rounded-lg overflow-hidden ${tier.highlighted ? "border-blue-400" : "border-gray-200"}`}>
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-1.5">
          {tier.highlighted && <Star size={12} className="text-amber-400 fill-amber-400" />}
          {tier.name || `Tier ${index + 1}`}
        </span>
        <div className="flex items-center gap-1">
          {index > 0 && (
            <span onClick={(e) => { e.stopPropagation(); onMove(-1); }}
              className="p-0.5 hover:text-blue-600 cursor-pointer"><ChevronUp size={14} /></span>
          )}
          {index < total - 1 && (
            <span onClick={(e) => { e.stopPropagation(); onMove(1); }}
              className="p-0.5 hover:text-blue-600 cursor-pointer"><ChevronDown size={14} /></span>
          )}
          <span onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-0.5 hover:text-red-500 cursor-pointer"><Trash2 size={13} /></span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && (
        <div className="p-3 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={tier.name} onChange={(e) => field("name", e.target.value)} placeholder="Basic" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Price</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={tier.price} onChange={(e) => field("price", e.target.value)} placeholder="$29" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Period</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={tier.period ?? ""} onChange={(e) => field("period", e.target.value)} placeholder="/month" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Badge</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={tier.badge ?? ""} onChange={(e) => field("badge", e.target.value)} placeholder="Popular" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">CTA Label</label>
            <input className="w-full border rounded px-2 py-1.5 text-sm"
              value={tier.ctaLabel ?? ""} onChange={(e) => field("ctaLabel", e.target.value)} placeholder="Get Started" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">CTA Link</label>
            <input className="w-full border rounded px-2 py-1.5 text-sm"
              value={tier.ctaHref ?? ""} onChange={(e) => field("ctaHref", e.target.value)} placeholder="#contact or https://" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!tier.highlighted}
              onChange={(e) => field("highlighted", e.target.checked)} />
            <span className="text-xs text-gray-700">Highlight this tier (featured)</span>
          </label>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Features (one per line)</label>
            <textarea
              className="w-full border rounded px-2 py-1.5 text-sm font-mono resize-none"
              rows={Math.max(3, (tier.features?.length ?? 0) + 1)}
              value={(tier.features ?? []).join("\n")}
              onChange={(e) => field("features", e.target.value.split("\n"))}
              placeholder={"Feature 1\nFeature 2\nFeature 3"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function PricingProperties({ block }: { block: PricingTableBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  function setTiers(tiers: PricingTier[]) {
    updateBlock(block.id, { tiers } as any);
  }

  function updateTier(index: number, tier: PricingTier) {
    const next = [...p.tiers];
    next[index] = tier;
    setTiers(next);
  }

  function addTier() {
    setTiers([...p.tiers, { name: "New Tier", price: "$0", period: "/month", features: ["Feature 1"], ctaLabel: "Get Started", ctaHref: "#" }]);
  }

  function deleteTier(index: number) {
    setTiers(p.tiers.filter((_, i) => i !== index));
  }

  function moveTier(index: number, dir: -1 | 1) {
    const next = [...p.tiers];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setTiers(next);
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Heading</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.heading ?? ""}
          onChange={(e) => updateBlock(block.id, { heading: e.target.value } as any)} />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Subheading</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.subheading ?? ""}
          onChange={(e) => updateBlock(block.id, { subheading: e.target.value } as any)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-600 font-medium">Pricing Tiers</label>
        {(p.tiers ?? []).map((tier, i) => (
          <TierEditor
            key={i}
            tier={tier}
            index={i}
            total={p.tiers.length}
            onChange={(t) => updateTier(i, t)}
            onDelete={() => deleteTier(i)}
            onMove={(dir) => moveTier(i, dir)}
          />
        ))}
        <button
          onClick={addTier}
          className="flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          <Plus size={14} /> Add Tier
        </button>
      </div>
    </div>
  );
}
