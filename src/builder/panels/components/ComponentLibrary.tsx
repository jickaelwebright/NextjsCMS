"use client";

import { useDraggable } from "@dnd-kit/core";
import { BLOCK_REGISTRY } from "@/builder/dnd/blockRegistry";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/types/page";
import type { DragData } from "@/types/builder";
import {
  Heading, Type, Image, MousePointerClick, LayoutTemplate,
  CreditCard, Video, Minus, Space, FormInput,
} from "lucide-react";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;
const ICONS: Record<string, IconComponent> = {
  Heading, Type, Image, MousePointerClick, LayoutTemplate,
  CreditCard, Video, Minus, Space, FormInput,
};

const CATEGORIES = [
  { id: "layout",      label: "Layout" },
  { id: "text",        label: "Text" },
  { id: "media",       label: "Media" },
  { id: "interactive", label: "Interactive" },
] as const;

function DraggableWidget({ type, label, icon }: { type: BlockType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  const dragData: DragData = { type: "NEW_BLOCK", blockType: type };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: dragData,
  });

  const Icon = icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col items-center gap-1 p-3 border rounded cursor-grab bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors select-none",
        isDragging && "opacity-40 cursor-grabbing"
      )}
    >
      <Icon size={20} className="text-gray-600" />
      <span className="text-xs text-gray-700 font-medium text-center">{label}</span>
    </div>
  );
}

export function ComponentLibrary() {
  return (
    <div className="flex flex-col gap-4 p-3">
      {CATEGORIES.map((cat) => {
        const items = BLOCK_REGISTRY.filter((b) => b.category === cat.id);
        if (!items.length) return null;
        return (
          <div key={cat.id}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {cat.label}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {items.map((block) => (
                <DraggableWidget key={block.type} type={block.type} label={block.label} icon={ICONS[block.icon] ?? Type} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
