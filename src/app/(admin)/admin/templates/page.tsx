"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Layout } from "lucide-react";
import { toast } from "sonner";

interface Template { id: string; name: string; category?: string; thumbnail?: string; createdAt: string; }

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/templates");
    if (r.ok) setTemplates(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function useTemplate(templateId: string) {
    const titleRaw = prompt("Page title?");
    if (!titleRaw) return;
    const slug = titleRaw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const r = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleRaw, slug, pageType: "page", templateId }),
    });
    if (r.ok) {
      const { id } = await r.json();
      router.push(`/admin/builder/${id}`);
    } else toast.error("Failed");
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Templates</h1>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Layout size={40} className="mx-auto mb-3 opacity-30" />
          <p>No templates yet.</p>
          <p className="text-xs mt-1">Save any page as a template from the builder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Layout size={32} className="text-blue-300" />
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                {t.category && <p className="text-xs text-gray-400 mt-0.5 capitalize">{t.category}</p>}
                <button onClick={() => useTemplate(t.id)}
                  className="mt-3 w-full py-1.5 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
