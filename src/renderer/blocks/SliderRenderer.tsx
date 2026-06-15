"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SliderBlock } from "@/types/page";

export function SliderRenderer({ block }: { block: SliderBlock }) {
  const { slides, autoplay, autoplayDelay = 4000, showDots = true, showArrows = true, height = "500px", overlayOpacity = 40 } = block.props;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const id = setInterval(next, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, next, slides.length]);

  if (!slides?.length) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: s.image ? `url(${s.image})` : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {overlayOpacity > 0 && (
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8 text-white">
            {s.heading && <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">{s.heading}</h2>}
            {s.subheading && <p className="text-xl mb-6 opacity-90 max-w-2xl">{s.subheading}</p>}
            {s.ctaLabel && (
              <a href={s.ctaHref ?? "#"}
                className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                {s.ctaLabel}
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
