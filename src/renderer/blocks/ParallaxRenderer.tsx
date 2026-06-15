"use client";

import { useEffect, useRef } from "react";
import type { ParallaxBlock } from "@/types/page";

export function ParallaxRenderer({ block }: { block: ParallaxBlock }) {
  const { backgroundImage, speed = 40, minHeight = "60vh", heading, subheading, overlayOpacity = 40, textColor = "#ffffff" } = block.props;
  const bgRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const rect = el.closest("[data-parallax-root]")?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const offset = (rect.top / window.innerHeight) * (speed ?? 40);
      el.style.transform = `translateY(${offset}px)`;
    }

    frameRef.current = requestAnimationFrame(onScroll);
    const handler = () => { cancelAnimationFrame(frameRef.current); frameRef.current = requestAnimationFrame(onScroll); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { window.removeEventListener("scroll", handler); cancelAnimationFrame(frameRef.current); };
  }, [speed]);

  return (
    <div
      data-parallax-root
      className="relative overflow-hidden w-full"
      style={{ minHeight }}
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 will-change-transform"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20" style={{ minHeight, color: textColor }}>
        {heading && <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">{heading}</h2>}
        {subheading && <p className="text-xl max-w-2xl opacity-90 drop-shadow">{subheading}</p>}
      </div>
    </div>
  );
}
