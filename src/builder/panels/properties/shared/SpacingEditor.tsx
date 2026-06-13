"use client";

import type { StyleProperties } from "@/types/page";

interface SpacingEditorProps {
  label?: string;
  value?: StyleProperties;
  onChange: (updates: Partial<StyleProperties>) => void;
}

const FIELDS: { key: keyof StyleProperties; label: string }[] = [
  { key: "paddingTop",    label: "PT" },
  { key: "paddingRight",  label: "PR" },
  { key: "paddingBottom", label: "PB" },
  { key: "paddingLeft",   label: "PL" },
  { key: "marginTop",     label: "MT" },
  { key: "marginBottom",  label: "MB" },
];

export function SpacingEditor({ label = "Spacing", value, onChange }: SpacingEditorProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {FIELDS.map(({ key, label: l }) => (
          <div key={key} className="flex flex-col gap-0.5">
            <label className="text-[10px] text-gray-400">{l}</label>
            <input
              type="text"
              value={(value as any)?.[key] ?? ""}
              onChange={(e) => onChange({ [key]: e.target.value })}
              placeholder="0px"
              className="border rounded px-1.5 py-1 text-xs w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
