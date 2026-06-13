"use client";

import { useState } from "react";
import { useBuilderStore, useBuilderHistory } from "@/builder/store/builderStore";
import { DevicePreviewToggle } from "./DevicePreviewToggle";
import { toast } from "sonner";
import { Undo2, Redo2, Save, Eye, Loader2 } from "lucide-react";
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

      <div className="ml-auto flex items-center gap-2">
        {isDirty && <span className="text-xs text-amber-600">Unsaved changes</span>}

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
