import { create } from "zustand";
import type { LeftPanelTab, PreviewDevice, SelectedNodeType } from "@/types/builder";

// ─── State shape ─────────────────────────────────────────────────────────────

interface UIState {
  selectedNodeId: string | null;
  selectedNodeType: SelectedNodeType;
  activeLeftTab: LeftPanelTab;
  previewDevice: PreviewDevice;
  isPreviewMode: boolean;
  dragOverColumnId: string | null;
}

// ─── Actions shape ────────────────────────────────────────────────────────────

interface UIActions {
  selectNode: (id: string, type: SelectedNodeType) => void;
  clearSelection: () => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  togglePreviewMode: () => void;
  setActiveLeftTab: (tab: LeftPanelTab) => void;
  setDragOverColumn: (id: string | null) => void;
}

type UIStore = UIState & UIActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  // ── Initial state ────────────────────────────────────────────────────────
  selectedNodeId: null,
  selectedNodeType: null,
  activeLeftTab: "widgets",
  previewDevice: "desktop",
  isPreviewMode: false,
  dragOverColumnId: null,

  // ── Actions ──────────────────────────────────────────────────────────────
  selectNode: (id, type) =>
    set({ selectedNodeId: id, selectedNodeType: type }),

  clearSelection: () =>
    set({ selectedNodeId: null, selectedNodeType: null }),

  setPreviewDevice: (device) => set({ previewDevice: device }),

  togglePreviewMode: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode })),

  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),

  setDragOverColumn: (id) => set({ dragOverColumnId: id }),
}));
