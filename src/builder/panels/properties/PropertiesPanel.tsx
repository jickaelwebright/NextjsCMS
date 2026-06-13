"use client";

import { useUIStore } from "@/builder/store/uiStore";
import { useBuilderStore } from "@/builder/store/builderStore";
import { HeadingProperties } from "./blocks/HeadingProperties";
import { TextProperties } from "./blocks/TextProperties";
import { ImageProperties } from "./blocks/ImageProperties";
import { ButtonProperties } from "./blocks/ButtonProperties";
import { HeroProperties } from "./blocks/HeroProperties";
import { CardProperties } from "./blocks/CardProperties";
import { SpacerProperties } from "./blocks/SpacerProperties";
import { SectionProperties } from "./blocks/SectionProperties";
import { Settings } from "lucide-react";
import type { PageDocument, Block, Section } from "@/types/page";

function BlockPropertyRouter({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":  return <HeadingProperties block={block} />;
    case "text":     return <TextProperties block={block} />;
    case "image":    return <ImageProperties block={block} />;
    case "button":   return <ButtonProperties block={block} />;
    case "hero":     return <HeroProperties block={block} />;
    case "card":     return <CardProperties block={block} />;
    case "spacer":   return <SpacerProperties block={block} />;
    default: return <p className="text-xs text-gray-400 p-3">No properties for {block.type}</p>;
  }
}

function findBlock(doc: PageDocument | null, id: string): Block | undefined {
  if (!doc) return undefined;
  for (const section of doc.sections) {
    for (const column of section.columns) {
      const b = column.blocks.find((bl: Block) => bl.id === id);
      if (b) return b;
    }
  }
  return undefined;
}

function findSection(doc: PageDocument | null, id: string): Section | undefined {
  if (!doc) return undefined;
  return doc.sections.find((s: Section) => s.id === id);
}

export function PropertiesPanel() {
  const { selectedNodeId, selectedNodeType, clearSelection } = useUIStore();
  const { document } = useBuilderStore();

  if (!selectedNodeId || !selectedNodeType) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 gap-2">
        <Settings size={32} className="opacity-30" />
        <p className="text-sm text-center">Select any element on the canvas to edit its properties</p>
      </div>
    );
  }

  if (selectedNodeType === "block") {
    const block = findBlock(document, selectedNodeId);
    if (!block) return null;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-semibold text-gray-600 capitalize">{block.type} Properties</span>
          <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <BlockPropertyRouter block={block} />
        </div>
      </div>
    );
  }

  if (selectedNodeType === "section") {
    const section = findSection(document, selectedNodeId);
    if (!section) return null;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-semibold text-gray-600">Section Properties</span>
          <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SectionProperties section={section} />
        </div>
      </div>
    );
  }

  return null;
}
