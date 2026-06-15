"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { generateId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { AccordionBlock } from "@/types/page";

export function AccordionProperties({ block }: { block: AccordionBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  function updateItem(id: string, patch: Partial<{ title: string; content: string }>) {
    updateBlock(block.id, {
      items: p.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addItem() {
    updateBlock(block.id, {
      items: [...p.items, { id: generateId(), title: "New Section", content: "Content goes here." }],
    });
  }

  function removeItem(id: string) {
    updateBlock(block.id, { items: p.items.filter((item) => item.id !== id) });
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Style</label>
        <div className="flex gap-1.5">
          {(["default", "bordered", "flush"] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateBlock(block.id, { style: s })}
              className={`flex-1 py-1 text-xs rounded border capitalize transition-colors ${
                (p.style ?? "default") === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="rounded"
          checked={p.allowMultiple ?? false}
          onChange={(e) => updateBlock(block.id, { allowMultiple: e.target.checked })}
        />
        <span className="text-sm text-gray-700">Allow multiple open</span>
      </label>

      <div className="flex flex-col gap-3">
        {p.items.map((item, idx) => (
          <div key={item.id} className="border rounded p-2.5 flex flex-col gap-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Item {idx + 1}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              rows={3}
              className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              value={item.content}
              onChange={(e) => updateItem(item.id, { content: e.target.value })}
              placeholder="Content..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded hover:border-indigo-400 hover:text-indigo-600 text-gray-500 justify-center"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
}
