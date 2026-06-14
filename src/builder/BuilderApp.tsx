"use client";

import { useEffect, useCallback } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
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
}

export function BuilderApp({ pageId, pageTitle, initialDocument }: BuilderAppProps) {
  const { setDocument, document: storeDoc, isDirty, deleteBlock, deleteSection, duplicateBlock } = useBuilderStore();
  const { selectedNodeId, selectedNodeType, editingBlockId, clearSelection } = useUIStore();

  // Load document into store on mount
  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument, setDocument]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't fire shortcuts when user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        editingBlockId !== null;

      // Ctrl+S — save
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

      // Escape — deselect
      if (e.key === "Escape") {
        clearSelection();
        return;
      }

      // Delete / Backspace — delete selected node
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        if (selectedNodeType === "block") {
          deleteBlock(selectedNodeId);
          clearSelection();
        } else if (selectedNodeType === "section") {
          deleteSection(selectedNodeId);
          clearSelection();
        }
        return;
      }

      // Ctrl+D — duplicate selected block
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedNodeId && selectedNodeType === "block") {
        e.preventDefault();
        duplicateBlock(selectedNodeId);
        return;
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
      <BuilderToolbar pageId={pageId} pageTitle={pageTitle} />
      <BuilderDndContext>
        <Group orientation="horizontal" className="flex-1 overflow-hidden">
          {/* Left panel: widgets + layers */}
          <Panel defaultSize={18} minSize={14} maxSize={28}>
            <LeftPanel />
          </Panel>
          <Separator className="w-1 bg-gray-200 hover:bg-blue-300 transition-colors cursor-col-resize" />

          {/* Canvas */}
          <Panel defaultSize={62} minSize={40}>
            <BuilderCanvas />
          </Panel>
          <Separator className="w-1 bg-gray-200 hover:bg-blue-300 transition-colors cursor-col-resize" />

          {/* Right panel: properties */}
          <Panel defaultSize={20} minSize={14} maxSize={30}>
            <RightPanel />
          </Panel>
        </Group>
      </BuilderDndContext>
    </div>
  );
}
