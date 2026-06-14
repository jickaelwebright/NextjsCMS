"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string; title: string; slug: string; type: string;
  status: string; price: number; stock: number; updatedAt: string;
}

const TABS = ["all", "physical", "digital", "variable"] as const;
type Tab = typeof TABS[number];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newType, setNewType] = useState<"physical" | "digital" | "variable">("physical");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch(tab === "all" ? "/api/products" : `/api/products?type=${tab}`);
    if (r.ok) setProducts(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, [tab]);

  async function create() {
    if (!newTitle || !newSlug) return;
    setCreating(true);
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, type: newType }),
    });
    if (r.ok) {
      const { id } = await r.json();
      router.push(`/admin/products/${id}`);
    } else {
      toast.error("Failed to create product");
      setCreating(false);
    }
  }

  async function deleteProduct(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteId(null);
    toast.success("Product deleted");
    load();
  }

  function fmtPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors -mb-px",
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products yet</p>
          <button onClick={() => setShowNew(true)} className="text-blue-600 hover:underline text-sm mt-2">Add your first product →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">/{p.slug} · <span className="capitalize">{p.type}</span></p>
              </div>
              <span className="text-sm font-semibold text-gray-800">{fmtPrice(p.price)}</span>
              {p.type !== "digital" && <span className="text-xs text-gray-400">{p.stock} in stock</span>}
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {p.status}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => router.push(`/admin/products/${p.id}`)} className="p-1.5 hover:bg-gray-100 rounded"><Edit size={14} /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New product modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Product</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Title</label>
                <input autoFocus className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newTitle} onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Slug</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Product Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                  <option value="physical">Physical (shipped)</option>
                  <option value="digital">Digital (download)</option>
                  <option value="variable">Variable (sizes/colors)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={create} disabled={!newTitle || !newSlug || creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete product?</h2>
            <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => deleteProduct(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
