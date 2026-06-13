import Image from "next/image";
import { styleToInline } from "@/lib/utils";
import type { ImageBlock } from "@/types/page";

export function ImageRenderer({ block }: { block: ImageBlock }) {
  const p = block.props;
  const style = styleToInline(block.styles?.desktop);

  if (!p.src) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
        No image selected
      </div>
    );
  }

  const img = (
    <div className="relative w-full" style={{ aspectRatio: "16/9", ...style }}>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        className={`object-${p.objectFit ?? "cover"} rounded`}
      />
    </div>
  );

  if (p.href) {
    return <a href={p.href} target="_blank" rel="noopener noreferrer">{img}</a>;
  }
  return img;
}
