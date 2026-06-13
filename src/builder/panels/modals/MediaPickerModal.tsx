"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/builder/store/uiStore";
import { useBuilderStore } from "@/builder/store/builderStore";
import { X, ImageIcon, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
}

export function MediaPickerModal() {
  const { mediaPickerOpen, mediaPickerTarget, closeMediaPicker } = useUIStore();
  const { updateBlock } = useBuilderStore();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mediaPickerOpen) return;
    setLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [mediaPickerOpen]);

  if (!mediaPickerOpen) return null;

  function handleSelect(url: string) {
    if (mediaPickerTarget) {
      updateBlock(mediaPickerTarget.blockId, { [mediaPickerTarget.field]: url });
    }
    closeMediaPicker();
  }

  const images = items.filter((m) => m.mimeType.startsWith("image/"));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeMediaPicker}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[720px] max-h-[580px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Media Library</h2>
          <button
            onClick={closeMediaPicker}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ImageIcon size={36} className="mb-2 opacity-30" />
              <p className="text-sm">No images uploaded yet.</p>
              <p className="text-xs mt-1">Upload images in the Media Library first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {images.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                  title={item.originalName}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.originalName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={closeMediaPicker}
            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
