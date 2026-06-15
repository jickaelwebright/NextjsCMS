"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import type { HtmlBlock } from "@/types/page";

export function HtmlProperties({ block }: { block: HtmlBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
        Raw HTML — only use trusted code. Scripts may not execute in the builder preview.
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">HTML</label>
        <textarea
          rows={12}
          className="w-full border rounded px-2 py-1.5 text-xs font-mono resize-y"
          value={p.html}
          onChange={(e) => updateBlock(block.id, { html: e.target.value })}
          placeholder="<p>Your custom HTML here</p>"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Wrapper CSS class</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm font-mono"
          value={p.wrapperClass ?? ""}
          onChange={(e) => updateBlock(block.id, { wrapperClass: e.target.value })}
          placeholder="prose max-w-none"
        />
      </div>
    </div>
  );
}
