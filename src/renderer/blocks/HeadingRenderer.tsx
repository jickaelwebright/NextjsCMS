import React from "react";
import { styleToInline } from "@/lib/utils";
import type { HeadingBlock } from "@/types/page";

const sizeClass: Record<number, string> = {
  1: "text-4xl font-bold",
  2: "text-3xl font-bold",
  3: "text-2xl font-semibold",
  4: "text-xl font-semibold",
  5: "text-lg font-medium",
  6: "text-base font-medium",
};

export function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const p = block.props;
  const alignClass = p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : "text-left";
  const style = { ...(p.color ? { color: p.color } : {}), ...styleToInline(block.styles?.desktop) };
  const className = `${sizeClass[p.level] ?? "text-2xl font-bold"} ${alignClass}`;

  return React.createElement(
    `h${p.level}`,
    { className, style },
    p.content
  );
}
