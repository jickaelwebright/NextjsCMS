"use client";

import { useState, useRef, useEffect } from "react";
import { useBuilderStore, useBuilderHistory } from "@/builder/store/builderStore";
import { DevicePreviewToggle } from "./DevicePreviewToggle";
import { toast } from "sonner";
import { Undo2, Redo2, Save, Eye, Loader2, BookmarkPlus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BuilderToolbarProps {
  pageId: string;
  pageTitle: string;
}

export function BuilderToolbar({ pageId, pageTitle }: BuilderToolbarProps) {
  const { document, isDirty, markSaved } = useBuilderStore();
  const { undo, redo, canUndo, canRedo } = useBuilderHistory();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Save as template state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (templateDialogOpen) {
      setTimeout(() => templateInputRef.current?.focus(), 50);
    }
  }, [templateDialogOpen]);

  async function handleSave() {
    if (!document || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(document),
      });
      if (!res.ok) throw new Error("Save failed");
      markSaved();
      toast.success("Saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/publish`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { status } = await res.json();
      toast.success(status === "published" ? "Page published!" : "Page unpublished");
    } catch {
      toast.error("Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSaveTemplate() {
    if (!document || !templateName.trim()) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          category: templateCategory.trim() || null,
          content: document,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Template saved!");
      setTemplateDialogOpen(false);
      setTemplateName("");
      setTemplateCategory("");
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 h-12 bg-white border-b border-gray-200 shrink-0">
      {/* Back link */}
      <Link href="/admin/pages" className="text-sm text-gray-500 hover:text-gray-700">
        ← Pages
      </Link>

      {/* Page title */}
      <span className="text-sm font-medium text-gray-800 mx-2 truncate max-w-[160px]">{pageTitle}</span>

      {/* Undo / Redo */}
      <button
        onClick={() => undo()}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={cn("p-1.5 rounded hover:bg-gray-100 disabled:opacity-30", !canUndo && "cursor-not-allowed")}
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={() => redo()}
        disabled={!canRedo}
        title="Redo"
        className={cn("p-1.5 rounded hover:bg-gray-100 disabled:opacity-30", !canRedo && "cursor-not-allowed")}
      >
        <Redo2 size={16} />
      </button>

      {/* Device toggle */}
      <DevicePreviewToggle />

      <div className="ml-auto flex items-center gap-2 relative">
        {isDirty && <span className="text-xs text-amber-600">Unsaved changes</span>}

        {/* Save as Template */}
        <div className="relative">
          <button
            onClick={() => setTemplateDialogOpen((o) => !o)}
            title="Save as Template"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
          >
            <BookmarkPlus size={16} />
          </button>

          {templateDialogOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Save as Template</h3>
                <button
                  onClick={() => setTemplateDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={templateInputRef}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="Template name *"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(); }}
                />
                <input
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="Category (optional)"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                />
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate || !templateName.trim()}
                  className="w-full py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {savingTemplate && <Loader2 size={13} className="animate-spin" />}
                  Save Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>

        {/* Publish */}
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-40"
        >
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
          Publish
        </button>
      </div>
    </header>
  );
}
