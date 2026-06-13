"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageItem {
  id: string; title: string; slug: string;
  status: string; pageType: string; updatedAt: string;
}

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/pages?type=page");
    setPages(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createPage() {
    if (!newTitle || !newSlug) return;
    setCreating(true);
    const r = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, pageType: "page" }),
    });
    if (r.ok) {
      const { id } = await r.json();
      router.push(`/admin/builder/${id}`);
    } else {
      toast.error("Failed to create page");
      setCreating(false);
    }
  }

  async function deletePage(id: string) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    setDeleteId(null);
    toast.success("Page deleted");
    load();
  }

  async function togglePublish(id: string) {
    const r = await fetch(`/api/pages/${id}/publish`, { method: "POST" });
    const { status } = await r.json();
    toast.success(status === "published" ? "Published" : "Unpublished");
    load();
  }

  async function duplicate(id: string) {
    const r = await fetch(`/api/pages/${id}/duplicate`, { method: "POST" });
    if (r.ok) { toast.success("Duplicated"); load(); }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> New Page
        </button>
      </div>

      {/* New Page Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create New Page</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Page Title</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  placeholder="About Us" autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Slug</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="about-us" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={createPage}
                disabled={!newTitle || !newSlug || creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages List */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-3">No pages yet</p>
          <button onClick={() => setShowNew(true)} className="text-blue-600 hover:underline text-sm">Create your first page →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                <p className="text-xs text-gray-400">/{page.slug}</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                page.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {page.status}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => router.push(`/admin/builder/${page.id}`)} title="Edit" className="p-1.5 hover:bg-gray-100 rounded">
                  <Edit size={14} />
                </button>
                <button onClick={() => togglePublish(page.id)} title="Toggle publish" className="p-1.5 hover:bg-gray-100 rounded">
                  {page.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => duplicate(page.id)} title="Duplicate" className="p-1.5 hover:bg-gray-100 rounded">
                  <Copy size={14} />
                </button>
                <button onClick={() => setDeleteId(page.id)} title="Delete" className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete page?</h2>
            <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => deletePage(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
