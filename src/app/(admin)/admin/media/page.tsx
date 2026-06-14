"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MediaItem { id: string; url: string; originalName: string; size: number; width?: number; height?: number; }

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/media");
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/media/upload", { method: "POST", body: fd });
    if (r.ok) { toast.success("Uploaded"); load(); }
    else toast.error("Upload failed");
    setUploading(false);
  }

  async function deleteMedia(id: string) {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    setDeletingId(null);
    toast.success("Deleted");
    load();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Upload size={16} /> Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" /> Uploading…
          </div>
        ) : (
          <p className="text-sm text-gray-500">Drag & drop images here, or <button onClick={() => inputRef.current?.click()} className="text-blue-600 hover:underline">browse</button></p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No media yet</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-100 group">
              <Image src={item.url} alt={item.originalName} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                <p className="text-white text-xs text-center truncate w-full">{item.originalName}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL copied"); }}
                  className="text-xs text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => setDeletingId(item.id)}
                  className="text-xs text-white bg-red-500/70 hover:bg-red-600/90 px-2 py-1 rounded flex items-center gap-1"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete image?</h2>
            <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => deleteMedia(deletingId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
