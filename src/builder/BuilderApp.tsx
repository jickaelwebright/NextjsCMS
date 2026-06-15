"use client";

import { useEffect, useCallback } from "react";
import { useBuilderStore } from "./store/builderStore";
import { useUIStore } from "./store/uiStore";
import { BuilderDndContext } from "./dnd/DndContext";
import { BuilderCanvas } from "./canvas/BuilderCanvas";
import { LeftPanel } from "./panels/LeftPanel";
import { RightPanel } from "./panels/RightPanel";
import { BuilderToolbar } from "./toolbar/BuilderToolbar";
import { MediaPickerModal } from "./panels/modals/MediaPickerModal";
import type { PageDocument } from "@/types/page";

interface BuilderAppProps {
  pageId: string;
  pageTitle: string;
  initialDocument: PageDocument;
  tenantSlug: string;
}

export function BuilderApp({ pageId, pageTitle, initialDocument, tenantSlug }: BuilderAppProps) {
  const { setDocument, document: storeDoc, isDirty, deleteBlock, deleteSection, duplicateBlock } = useBuilderStore();
  const { selectedNodeId, selectedNodeType, editingBlockId, clearSelection } = useUIStore();

  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument, setDocument]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        editingBlockId !== null;

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!storeDoc || !isDirty) return;
        fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storeDoc),
        });
        return;
      }

      if (isTyping) return;

      if (e.key === "Escape") { clearSelection(); return; }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        if (selectedNodeType === "block") { deleteBlock(selectedNodeId); clearSelection(); }
        else if (selectedNodeType === "section") { deleteSection(selectedNodeId); clearSelection(); }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedNodeId && selectedNodeType === "block") {
        e.preventDefault();
        duplicateBlock(selectedNodeId);
      }
    },
    [pageId, storeDoc, isDirty, selectedNodeId, selectedNodeType, editingBlockId, clearSelection, deleteBlock, deleteSection, duplicateBlock]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <MediaPickerModal />
      <BuilderToolbar pageId={pageId} pageTitle={pageTitle} tenantSlug={tenantSlug} />
      <BuilderDndContext>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 min-w-[220px] border-r border-gray-200 overflow-y-auto bg-white flex-shrink-0">
            <LeftPanel />
          </div>
          <div className="flex-1 overflow-auto">
            <BuilderCanvas />
          </div>
          <div className="w-72 min-w-[240px] border-l border-gray-200 overflow-y-auto bg-white flex-shrink-0">
            <RightPanel />
          </div>
        </div>
      </BuilderDndContext>
    </div>
  );
}
