"use client";

import type { VideoBlock } from "@/types/page";

function getEmbedUrl(url: string): string | null {
  if (url.includes("youtube.com/watch")) {
    const v = new URL(url).searchParams.get("v");
    return v ? `https://www.youtube.com/embed/${v}` : null;
  }
  if (url.includes("youtu.be/")) {
    const v = url.split("youtu.be/")[1]?.split("?")[0];
    return v ? `https://www.youtube.com/embed/${v}` : null;
  }
  if (url.includes("vimeo.com/")) {
    const v = url.split("vimeo.com/")[1]?.split("?")[0];
    return v ? `https://player.vimeo.com/video/${v}` : null;
  }
  return null;
}

export function VideoRenderer({ block }: { block: VideoBlock }) {
  const p = block.props;
  const embedUrl = getEmbedUrl(p.url);

  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (p.url) {
    return (
      <div className="w-full aspect-video">
        <video
          src={p.url}
          controls={p.controls !== false}
          autoPlay={p.autoplay}
          loop={p.loop}
          muted={p.muted}
          className="w-full h-full rounded object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
      No video URL set
    </div>
  );
}
