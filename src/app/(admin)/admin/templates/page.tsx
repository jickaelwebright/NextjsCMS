"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Layout, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Template { id: string; name: string; category?: string; thumbnail?: string; createdAt: string; }

interface UseModal { templateId: string; title: string; slug: string; pageType: string; }

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [useModal, setUseModal] = useState<UseModal | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/templates");
    if (r.ok) setTemplates(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openUse(t: Template) {
    setUseModal({ templateId: t.id, title: t.name, slug: t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), pageType: "page" });
  }

  async function applyTemplate() {
    if (!useModal || !useModal.title || !useModal.slug) return;
    setCreating(true);
    const r = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: useModal.title, slug: useModal.slug, pageType: useModal.pageType, templateId: useModal.templateId }),
    });
    if (r.ok) {
      const { id } = await r.json();
      router.push(`/builder/${id}`);
    } else {
      toast.error("Failed to create page");
      setCreating(false);
    }
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setDeleteId(null);
    toast.success("Template deleted");
    load();
  }

  const starterCategories = ["Marketing", "Business"];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Templates</h1>
      <p className="text-sm text-gray-500 mb-6">Start from a pre-built template or save any page as a template from the builder.</p>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Layout size={40} className="mx-auto mb-3 opacity-30" />
          <p>No templates yet.</p>
          <p className="text-xs mt-1">Save any page as a template from the builder toolbar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((t) => {
            const isStarter = starterCategories.includes(t.category ?? "");
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <Layout size={32} className="text-blue-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 text-sm flex-1">{t.name}</p>
                    {isStarter && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium shrink-0">Starter</span>
                    )}
                  </div>
                  {t.category && <p className="text-xs text-gray-400 mt-0.5 capitalize">{t.category}</p>}
                  <button onClick={() => openUse(t)}
                    className="mt-3 w-full py-1.5 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50">
                    Use Template
                  </button>
                </div>
                {!isStarter && (
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Use Template Modal */}
      {useModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create from Template</h2>
              <button onClick={() => setUseModal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Page Title</label>
                <input
                  autoFocus
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={useModal.title}
                  onChange={(e) => setUseModal({ ...useModal, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Slug</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={useModal.slug}
                  onChange={(e) => setUseModal({ ...useModal, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Page Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={useModal.pageType}
                  onChange={(e) => setUseModal({ ...useModal, pageType: e.target.value })}>
                  <option value="page">Page</option>
                  <option value="post">Blog Post</option>
                  <option value="landing">Landing Page</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setUseModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={applyTemplate} disabled={creating || !useModal.title || !useModal.slug}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete template?</h2>
            <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => deleteTemplate(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
