"use client";

import { useBuilderStore } from "@/builder/store/builderStore";
import { generateId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { FormBlock, FormField } from "@/types/page";

const FIELD_TYPES: FormField["type"][] = ["text", "email", "textarea", "select", "checkbox"];

export function FormProperties({ block }: { block: FormBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;
  const fields: FormField[] = p.fields ?? [];

  function setFields(updated: FormField[]) {
    updateBlock(block.id, { fields: updated });
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFields([
      ...fields,
      { id: generateId(), type: "text", label: "New Field", placeholder: "", required: false },
    ]);
  }

  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Submit Button Label</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.submitLabel ?? "Submit"}
          onChange={(e) => updateBlock(block.id, { submitLabel: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Success Message</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.successMessage ?? ""}
          onChange={(e) => updateBlock(block.id, { successMessage: e.target.value })}
          placeholder="Thank you! We'll be in touch."
        />
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Email Submissions To</label>
        <input
          className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.emailTo ?? ""}
          onChange={(e) => updateBlock(block.id, { emailTo: e.target.value })}
          placeholder="you@example.com"
        />
      </div>

      {/* Fields editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Fields ({fields.length})</span>
          <button
            onClick={addField}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus size={12} /> Add Field
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <div key={field.id} className="border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center gap-1 mb-1.5">
                <input
                  className="flex-1 border rounded px-2 py-1 text-xs"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Field label"
                />
                <button
                  onClick={() => removeField(field.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 border rounded px-1.5 py-1 text-xs"
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  />
                  Required
                </label>
              </div>
              <input
                className="mt-1.5 w-full border rounded px-2 py-1 text-xs"
                value={field.placeholder ?? ""}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                placeholder="Placeholder (optional)"
              />
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3">No fields yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
