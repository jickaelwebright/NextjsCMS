import { styleToInline } from "@/lib/utils";
import type { ButtonBlock } from "@/types/page";

const VARIANT_CLASS: Record<string, string> = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  outline:   "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  ghost:     "text-blue-600 hover:bg-blue-50",
};

const SIZE_CLASS: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-base",
  lg: "px-7 py-3 text-lg",
};

export function ButtonRenderer({ block }: { block: ButtonBlock }) {
  const p = block.props;
  const variantCls = VARIANT_CLASS[p.variant ?? "primary"];
  const sizeCls = SIZE_CLASS[p.size ?? "md"];
  const alignCls = p.align === "center" ? "flex justify-center" : p.align === "right" ? "flex justify-end" : "";
  const style = styleToInline(block.styles?.desktop);

  return (
    <div className={alignCls} style={style}>
      <a
        href={p.href}
        target={p.openInNewTab ? "_blank" : undefined}
        rel={p.openInNewTab ? "noopener noreferrer" : undefined}
        className={`inline-block rounded font-medium transition-colors ${variantCls} ${sizeCls}`}
      >
        {p.label}
      </a>
    </div>
  );
}
