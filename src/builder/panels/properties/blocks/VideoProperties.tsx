"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { VideoBlock } from "@/types/page";

type BoolKey = "controls" | "autoplay" | "loop" | "muted";
const TOGGLES: { key: BoolKey; label: string }[] = [
  { key: "controls", label: "Show Controls" },
  { key: "autoplay", label: "Autoplay" },
  { key: "loop", label: "Loop" },
  { key: "muted", label: "Muted" },
];

const ASPECT_RATIOS = [
  { label: "16:9", value: "16/9" },
  { label: "4:3", value: "4/3" },
  { label: "1:1", value: "1/1" },
  { label: "9:16", value: "9/16" },
];

export function VideoProperties({ block }: { block: VideoBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Video URL</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.url}
          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-400 mt-1">Paste a YouTube, Vimeo, or direct MP4 URL</p>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Aspect Ratio</label>
        <div className="flex gap-1.5 flex-wrap">
          {ASPECT_RATIOS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updateBlock(block.id, { aspectRatio: value })}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                (p.aspectRatio ?? "16/9") === value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {TOGGLES.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={p[key] ?? (key === "controls")}
            onChange={(e) => updateBlock(block.id, { [key]: e.target.checked })}
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
      ))}
    </div>
  );
}
