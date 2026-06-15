import type { EmbedBlock } from "@/types/page";

export function EmbedRenderer({ block }: { block: EmbedBlock }) {
  const { src, height = "450px", title = "Embedded content", scrolling = false } = block.props;

  if (!src) {
    return (
      <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm" style={{ height }}>
        No URL set — add a URL in properties
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title={title}
      height={height}
      scrolling={scrolling ? "yes" : "no"}
      className="w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
