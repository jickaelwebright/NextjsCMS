import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { generateId, emptyStyles } from "@/lib/utils";
import type {
  Block,
  Column,
  ColumnLayout,
  PageDocument,
  PageMeta,
  PageSettings,
  ResponsiveStyle,
  Section,
} from "@/types/page";
import { COLUMN_LAYOUT_SPANS } from "@/types/page";

// ─── State shape ─────────────────────────────────────────────────────────────

interface BuilderState {
  document: PageDocument | null;
  isDirty: boolean;
  isSaving: boolean;
}

// ─── Actions shape ────────────────────────────────────────────────────────────

interface BuilderActions {
  setDocument: (doc: PageDocument) => void;

  // Section actions
  addSection: (section: Section, atIndex?: number) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  moveSections: (fromIndex: number, toIndex: number) => void;
  resizeSectionColumns: (sectionId: string, newLayout: ColumnLayout) => void;

  // Block actions
  addBlock: (
    sectionId: string,
    columnId: string,
    block: Block,
    atIndex?: number
  ) => void;
  updateBlock: (blockId: string, updates: Partial<Block["props"]>) => void;
  updateBlockStyles: (
    blockId: string,
    styles: Partial<ResponsiveStyle>
  ) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (
    blockId: string,
    targetSectionId: string,
    targetColumnId: string,
    atIndex: number
  ) => void;
  duplicateBlock: (blockId: string) => void;

  // Page-level actions
  updateMeta: (meta: Partial<PageMeta>) => void;
  updateSettings: (settings: Partial<PageSettings>) => void;

  // Dirty / saving flags
  markDirty: () => void;
  markSaved: () => void;
}

type BuilderStore = BuilderState & BuilderActions;

// ─── Helper: find a block by id across all sections/columns ──────────────────

function findBlock(
  doc: PageDocument,
  blockId: string
): { sectionIdx: number; columnIdx: number; blockIdx: number } | null {
  for (let si = 0; si < doc.sections.length; si++) {
    const section = doc.sections[si];
    for (let ci = 0; ci < section.columns.length; ci++) {
      const column = section.columns[ci];
      for (let bi = 0; bi < column.blocks.length; bi++) {
        if (column.blocks[bi].id === blockId) {
          return { sectionIdx: si, columnIdx: ci, blockIdx: bi };
        }
      }
    }
  }
  return null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderStore>()(
  temporal(
    immer<BuilderStore>((set) => ({
      // ── Initial state ─────────────────────────────────────────────────────
      document: null,
      isDirty: false,
      isSaving: false,

      // ── Document ──────────────────────────────────────────────────────────
      setDocument: (doc) =>
        set((state) => {
          state.document = doc;
          state.isDirty = false;
        }),

      // ── Sections ──────────────────────────────────────────────────────────
      addSection: (section, atIndex) =>
        set((state) => {
          if (!state.document) return;
          if (atIndex !== undefined) {
            state.document.sections.splice(atIndex, 0, section);
          } else {
            state.document.sections.push(section);
          }
          state.isDirty = true;
        }),

      updateSection: (sectionId, updates) =>
        set((state) => {
          if (!state.document) return;
          const section = state.document.sections.find(
            (s) => s.id === sectionId
          );
          if (!section) return;
          Object.assign(section, updates);
          state.isDirty = true;
        }),

      deleteSection: (sectionId) =>
        set((state) => {
          if (!state.document) return;
          const idx = state.document.sections.findIndex(
            (s) => s.id === sectionId
          );
          if (idx === -1) return;
          state.document.sections.splice(idx, 1);
          state.isDirty = true;
        }),

      moveSections: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.document) return;
          const sections = state.document.sections;
          if (
            fromIndex < 0 ||
            fromIndex >= sections.length ||
            toIndex < 0 ||
            toIndex >= sections.length
          )
            return;
          const [moved] = sections.splice(fromIndex, 1);
          sections.splice(toIndex, 0, moved);
          state.isDirty = true;
        }),

      resizeSectionColumns: (sectionId, newLayout) =>
        set((state) => {
          if (!state.document) return;
          const section = state.document.sections.find((s) => s.id === sectionId);
          if (!section) return;
          const newSpans = COLUMN_LAYOUT_SPANS[newLayout];
          const oldColumns = section.columns as Column[];
          // Build new columns, preserving existing blocks
          const newColumns: Column[] = newSpans.map((span, i) => {
            if (i < oldColumns.length) return { ...oldColumns[i], span };
            return { id: generateId(), span, blocks: [], styles: emptyStyles() };
          });
          // Merge orphaned blocks into last column when reducing
          for (let i = newSpans.length; i < oldColumns.length; i++) {
            newColumns[newSpans.length - 1].blocks.push(...oldColumns[i].blocks);
          }
          section.columns = newColumns;
          section.columnLayout = newLayout;
          state.isDirty = true;
        }),

      // ── Blocks ────────────────────────────────────────────────────────────
      addBlock: (sectionId, columnId, block, atIndex) =>
        set((state) => {
          if (!state.document) return;
          const section = state.document.sections.find(
            (s) => s.id === sectionId
          );
          if (!section) return;
          const column = section.columns.find((c) => c.id === columnId);
          if (!column) return;
          if (atIndex !== undefined) {
            column.blocks.splice(atIndex, 0, block);
          } else {
            column.blocks.push(block);
          }
          state.isDirty = true;
        }),

      updateBlock: (blockId, updates) =>
        set((state) => {
          if (!state.document) return;
          const location = findBlock(state.document as PageDocument, blockId);
          if (!location) return;
          const { sectionIdx, columnIdx, blockIdx } = location;
          const block =
            state.document.sections[sectionIdx].columns[columnIdx].blocks[
              blockIdx
            ];
          // Merge the updates into the block's props
          Object.assign(block.props, updates);
          state.isDirty = true;
        }),

      updateBlockStyles: (blockId, styles) =>
        set((state) => {
          if (!state.document) return;
          const location = findBlock(state.document as PageDocument, blockId);
          if (!location) return;
          const { sectionIdx, columnIdx, blockIdx } = location;
          const block =
            state.document.sections[sectionIdx].columns[columnIdx].blocks[
              blockIdx
            ];
          block.styles = { ...block.styles, ...styles };
          state.isDirty = true;
        }),

      deleteBlock: (blockId) =>
        set((state) => {
          if (!state.document) return;
          for (const section of state.document.sections) {
            for (const column of section.columns) {
              const idx = column.blocks.findIndex((b) => b.id === blockId);
              if (idx !== -1) {
                column.blocks.splice(idx, 1);
                state.isDirty = true;
                return;
              }
            }
          }
        }),

      moveBlock: (blockId, targetSectionId, targetColumnId, atIndex) =>
        set((state) => {
          if (!state.document) return;

          // Extract the block from its current location
          let extracted: Block | null = null;
          for (const section of state.document.sections) {
            for (const column of section.columns) {
              const idx = column.blocks.findIndex((b) => b.id === blockId);
              if (idx !== -1) {
                extracted = column.blocks.splice(idx, 1)[0];
                break;
              }
            }
            if (extracted) break;
          }
          if (!extracted) return;

          // Insert into target location
          const targetSection = state.document.sections.find(
            (s) => s.id === targetSectionId
          );
          if (!targetSection) return;
          const targetColumn = targetSection.columns.find(
            (c) => c.id === targetColumnId
          );
          if (!targetColumn) return;

          const insertIdx = Math.min(atIndex, targetColumn.blocks.length);
          targetColumn.blocks.splice(insertIdx, 0, extracted);
          state.isDirty = true;
        }),

      duplicateBlock: (blockId) =>
        set((state) => {
          if (!state.document) return;
          for (const section of state.document.sections) {
            for (const column of section.columns) {
              const idx = column.blocks.findIndex((b) => b.id === blockId);
              if (idx !== -1) {
                // Deep clone via JSON round-trip then assign a new id
                const original = column.blocks[idx];
                const clone = JSON.parse(JSON.stringify(original)) as Block;
                clone.id = generateId();
                column.blocks.splice(idx + 1, 0, clone);
                state.isDirty = true;
                return;
              }
            }
          }
        }),

      // ── Page-level ────────────────────────────────────────────────────────
      updateMeta: (meta) =>
        set((state) => {
          if (!state.document) return;
          Object.assign(state.document.meta, meta);
          state.isDirty = true;
        }),

      updateSettings: (settings) =>
        set((state) => {
          if (!state.document) return;
          Object.assign(state.document.settings, settings);
          state.isDirty = true;
        }),

      // ── Flags ─────────────────────────────────────────────────────────────
      markDirty: () =>
        set((state) => {
          state.isDirty = true;
        }),

      markSaved: () =>
        set((state) => {
          state.isDirty = false;
          state.isSaving = false;
        }),
    }))
  )
);

// ─── Undo / redo helper hook ──────────────────────────────────────────────────

export function useBuilderHistory() {
  const { undo, redo, pastStates, futureStates } =
    useBuilderStore.temporal.getState();

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}
