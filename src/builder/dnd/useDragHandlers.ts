import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { createBlock } from "@/lib/utils";
import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import type { DragData } from "@/types/builder";

// ─── Over-id format ───────────────────────────────────────────────────────────
// Droppable columns encode their ids as:
//   "column:sectionId:columnId:index"   (with preferred insertion index)
// or
//   "column:sectionId:columnId"         (append to end)

interface ParsedOverId {
  sectionId: string;
  columnId: string;
  index: number;
}

function parseOverId(overId: string): ParsedOverId | null {
  const parts = overId.split(":");
  // Expect at least: "column", sectionId, columnId  (3 parts)
  if (parts.length < 3 || parts[0] !== "column") return null;
  const sectionId = parts[1];
  const columnId = parts[2];
  const index = parts.length >= 4 ? parseInt(parts[3], 10) : Infinity;
  return { sectionId, columnId, index: isNaN(index) ? Infinity : index };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDragHandlers() {
  const builderStore = useBuilderStore;
  const uiStore = useUIStore;

  const onDragStart = (_event: DragStartEvent) => {
    // Could be used to set a global "is dragging" flag if needed.
  };

  const onDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    uiStore.getState().setDragOverColumn(overId);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Always clear the drag-over highlight
    uiStore.getState().setDragOverColumn(null);

    if (!over) return;

    const dragData = active.data.current as DragData | undefined;
    if (!dragData) return;

    const overId = String(over.id);
    const parsed = parseOverId(overId);
    if (!parsed) return;

    const { sectionId, columnId, index } = parsed;
    const insertIndex = index === Infinity ? undefined : index;

    if (dragData.type === "NEW_BLOCK") {
      const newBlock = createBlock(dragData.blockType);
      builderStore
        .getState()
        .addBlock(sectionId, columnId, newBlock, insertIndex);
    } else if (dragData.type === "EXISTING_BLOCK") {
      const { blockId } = dragData;
      builderStore
        .getState()
        .moveBlock(blockId, sectionId, columnId, insertIndex ?? 0);
    }
  };

  return { onDragStart, onDragOver, onDragEnd };
}
