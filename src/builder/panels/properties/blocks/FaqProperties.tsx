"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { generateId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { FaqBlock } from "@/types/page";

export function FaqProperties({ block }: { block: FaqBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  function updateItem(id: string, patch: Partial<{ question: string; answer: string }>) {
    updateBlock(block.id, {
      items: p.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  }

  function addItem() {
    updateBlock(block.id, {
      items: [...p.items, { id: generateId(), question: "New question?", answer: "Answer goes here." }],
    });
  }

  function removeItem(id: string) {
    updateBlock(block.id, { items: p.items.filter((item) => item.id !== id) });
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Section Heading</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.heading ?? ""}
          onChange={(e) => updateBlock(block.id, { heading: e.target.value })}
          placeholder="Frequently Asked Questions"
        />
      </div>

      <div className="flex flex-col gap-3">
        {p.items.map((item, idx) => (
          <div key={item.id} className="border rounded p-2.5 flex flex-col gap-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Q{idx + 1}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={item.question}
              onChange={(e) => updateItem(item.id, { question: e.target.value })}
              placeholder="Question?"
            />
            <textarea
              rows={3}
              className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              value={item.answer}
              onChange={(e) => updateItem(item.id, { answer: e.target.value })}
              placeholder="Answer..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded hover:border-indigo-400 hover:text-indigo-600 text-gray-500 justify-center"
      >
        <Plus size={14} /> Add Question
      </button>
    </div>
  );
}
