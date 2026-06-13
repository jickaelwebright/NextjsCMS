"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { styleToInline, cn } from "@/lib/utils";
import type { TextBlock, HeadingBlock } from "@/types/page";

const TEXT_SIZE_CLASS: Record<string, string> = {
  xs: "text-xs", sm: "text-sm", base: "text-base",
  lg: "text-lg", xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl",
};

const HEADING_SIZE_CLASS: Record<number, string> = {
  1: "text-4xl font-bold",
  2: "text-3xl font-bold",
  3: "text-2xl font-semibold",
  4: "text-xl font-semibold",
  5: "text-lg font-medium",
  6: "text-base font-medium",
};

export function InlineBlockEditor({ block }: { block: TextBlock | HeadingBlock }) {
  const { updateBlock } = useBuilderStore();
  const { setEditingBlock } = useUIStore();
  const isHeading = block.type === "heading";

  const editor = useEditor({
    extensions: isHeading
      ? [StarterKit]
      : [StarterKit, Link.configure({ openOnClick: false })],
    content: block.props.content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      updateBlock(block.id, {
        content: isHeading ? editor.getText() : editor.getHTML(),
      });
    },
    onBlur() {
      setEditingBlock(null);
    },
    editorProps: {
      attributes: { class: "outline-none focus:outline-none" },
    },
  });

  useEffect(() => {
    editor?.commands.focus("end");
  }, [editor]);

  if (isHeading) {
    const hp = (block as HeadingBlock).props;
    const alignClass =
      hp.align === "center" ? "text-center"
      : hp.align === "right" ? "text-right"
      : "text-left";
    const sizeClass = HEADING_SIZE_CLASS[hp.level] ?? "text-2xl font-bold";
    return (
      <div
        className={cn(sizeClass, alignClass)}
        style={{ ...(hp.color ? { color: hp.color } : {}), ...styleToInline(block.styles?.desktop) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <EditorContent editor={editor} />
      </div>
    );
  }

  const tp = (block as TextBlock).props;
  const alignClass =
    tp.align === "center" ? "text-center"
    : tp.align === "right" ? "text-right"
    : tp.align === "justify" ? "text-justify"
    : "text-left";
  const fsClass = TEXT_SIZE_CLASS[tp.fontSize ?? "base"] ?? "text-base";

  return (
    <div
      className={cn("prose max-w-none", alignClass, fsClass)}
      style={{ ...(tp.color ? { color: tp.color } : {}), ...styleToInline(block.styles?.desktop) }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
