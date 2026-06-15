"use client";

import { useState } from "react";
import type { AccordionBlock } from "@/types/page";
import { cn } from "@/lib/utils";

export function AccordionRenderer({ block }: { block: AccordionBlock }) {
  const { items, allowMultiple, style = "default" } = block.props;
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return allowMultiple ? [...prev, id] : [id];
    });
  }

  const wrapperClass = cn(
    "py-6 px-4 max-w-3xl mx-auto space-y-2",
    style === "flush" && "space-y-0"
  );

  return (
    <div className={wrapperClass}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              style === "bordered" && "border border-gray-200 rounded-lg overflow-hidden",
              style === "flush" && "border-b border-gray-200 last:border-b-0",
              style === "default" && "bg-gray-50 rounded-lg overflow-hidden"
            )}
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-100/60 transition-colors"
            >
              <span>{item.title}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={cn("flex-shrink-0 ml-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
