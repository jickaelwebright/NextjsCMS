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
          placeholder="https://youtube.com/watch?v=... or /uploads/video.mp4"
        />
        <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, or direct MP4 URL</p>
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
