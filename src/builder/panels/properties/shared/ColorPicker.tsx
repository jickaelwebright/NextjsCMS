"use client";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600 flex-1">{label}</label>
      <div className="flex items-center gap-1.5 border rounded px-1.5 py-1">
        <input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 cursor-pointer border-0 p-0 rounded"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-20 text-xs border-0 outline-none font-mono"
        />
      </div>
    </div>
  );
}
