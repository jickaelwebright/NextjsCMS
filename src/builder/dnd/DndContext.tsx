"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { useDragHandlers } from "./useDragHandlers";
import { useUIStore } from "@/builder/store/uiStore";

function DragSkeleton({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-xl opacity-90 pointer-events-none select-none min-w-[100px]">
      <div className="w-4 h-4 rounded bg-white/30" />
      <span>{label}</span>
    </div>
  );
}

export function BuilderDndContext({ children }: { children: React.ReactNode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const { onDragStart, onDragOver, onDragEnd } = useDragHandlers();
  const activeDragLabel = useUIStore((s) => s.activeDragLabel);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeDragLabel ? <DragSkeleton label={activeDragLabel} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
