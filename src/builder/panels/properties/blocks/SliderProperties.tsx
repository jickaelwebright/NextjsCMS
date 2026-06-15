"use client";

import { useState } from "react";
import { useBuilderStore } from "@/builder/store/builderStore";
import { useUIStore } from "@/builder/store/uiStore";
import { Plus, Trash2, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import type { SliderBlock } from "@/types/page";

type Slide = SliderBlock["props"]["slides"][0];

function SlideEditor({ slide, index, total, onChange, onDelete, onMove }: {
  slide: Slide; index: number; total: number;
  onChange: (s: Slide) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const { openMediaPicker } = useUIStore();
  const f = (k: keyof Slide, v: unknown) => onChange({ ...slide, [k]: v });

  return (
    <div className="border rounded-lg overflow-hidden border-gray-200">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Slide {index + 1}{slide.heading ? ` — ${slide.heading}` : ""}</span>
        <div className="flex items-center gap-1">
          {index > 0 && <span onClick={(e) => { e.stopPropagation(); onMove(-1); }} className="p-0.5 hover:text-blue-600 cursor-pointer"><ChevronUp size={14} /></span>}
          {index < total - 1 && <span onClick={(e) => { e.stopPropagation(); onMove(1); }} className="p-0.5 hover:text-blue-600 cursor-pointer"><ChevronDown size={14} /></span>}
          <span onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-0.5 hover:text-red-500 cursor-pointer"><Trash2 size={13} /></span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="p-3 flex flex-col gap-2.5">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Background Image</label>
            <button
              onClick={() => openMediaPicker(`slide-${index}`, "image")}
              className="w-full flex items-center gap-2 border rounded px-2 py-1.5 text-sm hover:bg-gray-50 text-gray-700 mb-1"
            >
              <ImageIcon size={14} className="text-gray-400" />
              {slide.image ? "Change image" : "Choose from library"}
            </button>
            <input className="w-full border rounded px-2 py-1 text-xs text-gray-500"
              value={slide.image ?? ""} onChange={(e) => f("image", e.target.value)} placeholder="or paste URL..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Heading</label>
            <input className="w-full border rounded px-2 py-1.5 text-sm"
              value={slide.heading ?? ""} onChange={(e) => f("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Subheading</label>
            <textarea rows={2} className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              value={slide.subheading ?? ""} onChange={(e) => f("subheading", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">CTA Label</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={slide.ctaLabel ?? ""} onChange={(e) => f("ctaLabel", e.target.value)} placeholder="Learn More" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">CTA Link</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm"
                value={slide.ctaHref ?? ""} onChange={(e) => f("ctaHref", e.target.value)} placeholder="#" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SliderProperties({ block }: { block: SliderBlock }) {
  const { updateBlock } = useBuilderStore();
  const p = block.props;

  function setSlides(slides: Slide[]) { updateBlock(block.id, { slides } as any); }
  function updateSlide(i: number, s: Slide) { const n = [...p.slides]; n[i] = s; setSlides(n); }
  function addSlide() { setSlides([...p.slides, { image: "", heading: `Slide ${p.slides.length + 1}`, subheading: "", ctaLabel: "Learn More", ctaHref: "#" }]); }
  function deleteSlide(i: number) { setSlides(p.slides.filter((_, j) => j !== i)); }
  function moveSlide(i: number, dir: -1 | 1) {
    const n = [...p.slides]; const t = i + dir;
    if (t < 0 || t >= n.length) return;
    [n[i], n[t]] = [n[t], n[i]]; setSlides(n);
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600 block mb-1">Height</label>
        <input className="w-full border rounded px-2 py-1.5 text-sm"
          value={p.height ?? "500px"} onChange={(e) => updateBlock(block.id, { height: e.target.value } as any)}
          placeholder="500px or 60vh" />
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Overlay Opacity ({p.overlayOpacity ?? 40}%)</label>
        <input type="range" min={0} max={90} step={5} className="w-full"
          value={p.overlayOpacity ?? 40}
          onChange={(e) => updateBlock(block.id, { overlayOpacity: Number(e.target.value) } as any)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!p.autoplay} onChange={(e) => updateBlock(block.id, { autoplay: e.target.checked } as any)} />
          <span className="text-xs text-gray-700">Autoplay</span>
        </label>
        {p.autoplay && (
          <div>
            <label className="text-xs text-gray-600 block mb-1">Delay (ms)</label>
            <input type="number" min={1000} step={500} className="w-full border rounded px-2 py-1.5 text-sm"
              value={p.autoplayDelay ?? 4000} onChange={(e) => updateBlock(block.id, { autoplayDelay: Number(e.target.value) } as any)} />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={p.showArrows !== false} onChange={(e) => updateBlock(block.id, { showArrows: e.target.checked } as any)} />
          <span className="text-xs text-gray-700">Show arrows</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={p.showDots !== false} onChange={(e) => updateBlock(block.id, { showDots: e.target.checked } as any)} />
          <span className="text-xs text-gray-700">Show dots</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-600 font-medium">Slides</label>
        {(p.slides ?? []).map((s, i) => (
          <SlideEditor key={i} slide={s} index={i} total={p.slides.length}
            onChange={(s) => updateSlide(i, s)} onDelete={() => deleteSlide(i)} onMove={(d) => moveSlide(i, d)} />
        ))}
        <button onClick={addSlide}
          className="flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">
          <Plus size={14} /> Add Slide
        </button>
      </div>
    </div>
  );
}
