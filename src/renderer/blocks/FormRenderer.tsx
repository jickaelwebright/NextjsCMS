"use client";

import { useState } from "react";
import type { FormBlock, FormField } from "@/types/page";

export function FormRenderer({ block }: { block: FormBlock }) {
  const p = block.props;
  const fields = p.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: p.formId ?? "inline", data: values }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded text-green-800 text-center">
        {p.successMessage ?? "Thank you! We'll be in touch."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg bg-white">
      {fields.map((field: FormField) => (
        <div key={field.id} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values[field.label] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
            />
          ) : field.type === "select" ? (
            <select
              required={field.required}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values[field.label] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
            >
              <option value="">Select…</option>
              {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={values[field.label] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
            />
          )}
        </div>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Sending…" : (p.submitLabel ?? "Submit")}
      </button>
    </form>
  );
}
