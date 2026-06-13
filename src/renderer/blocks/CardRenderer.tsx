import Image from "next/image";
import { styleToInline } from "@/lib/utils";
import type { CardBlock } from "@/types/page";

const VARIANT_CLASS: Record<string, string> = {
  default:  "bg-white border border-gray-200",
  outlined: "border-2 border-gray-300",
  elevated: "bg-white shadow-lg",
};

export function CardRenderer({ block }: { block: CardBlock }) {
  const p = block.props;
  const variantCls = VARIANT_CLASS[p.variant ?? "default"];
  const style = styleToInline(block.styles?.desktop);

  return (
    <div className={`rounded-lg overflow-hidden ${variantCls}`} style={style}>
      {p.image && (
        <div className="relative w-full h-48">
          <Image src={p.image} alt={p.heading} fill className="object-cover" />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{p.heading}</h3>
        <p className="text-gray-600 text-sm">{p.body}</p>
        {p.ctaLabel && p.ctaHref && (
          <a href={p.ctaHref} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            {p.ctaLabel} →
          </a>
        )}
      </div>
    </div>
  );
}
