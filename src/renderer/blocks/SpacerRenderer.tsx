import type { SpacerBlock } from "@/types/page";

export function SpacerRenderer({ block }: { block: SpacerBlock }) {
  return <div style={{ height: `${block.props.height}px` }} aria-hidden="true" />;
}
