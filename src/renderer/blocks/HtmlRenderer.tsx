import type { HtmlBlock } from "@/types/page";

export function HtmlRenderer({ block }: { block: HtmlBlock }) {
  const { html, wrapperClass = "" } = block.props;
  return (
    <div
      className={wrapperClass || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
