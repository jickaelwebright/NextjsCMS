import type { BlockType } from "./page";

export type PreviewDevice = "mobile" | "tablet" | "desktop";
export type SelectedNodeType = "section" | "column" | "block" | null;
export type LeftPanelTab = "widgets" | "layers" | "ai";

export interface BlockMeta {
  type: BlockType;
  label: string;
  icon: string;
  category: "layout" | "text" | "media" | "interactive";
  description: string;
}

export type DragData =
  | { type: "NEW_BLOCK"; blockType: BlockType }
  | {
      type: "EXISTING_BLOCK";
      blockId: string;
      sourceSectionId: string;
      sourceColumnId: string;
    };

export type { BlockType } from "@/types/page";
