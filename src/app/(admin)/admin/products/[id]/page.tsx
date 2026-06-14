"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string; title: string; slug: string; description: string; shortDescription: string | null;
  type: "physical" | "digital" | "variable"; status: "draft" | "published" | "archived";
  price: number; salePrice: number | null; sku: string | null; stock: number;
  stockTracking: boolean; images: string; categories: string; downloadFiles: string;
  weight: number | null;
}

interface Variant {
  id: string; name: string; sku: string; price: number; salePrice: number | null;
  stock: number; attributes: string;
}

type Tab = "details" | "pricing" | "images" | "files" | "variants";

const TABS: { key: Tab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "images", label: "Images" },
  { key: "files", label: "Digital Files" },
  { key: "variants", label: "Variants" },
];

function cents(v: number | null) { return v != null ? (v / 100).toFixed(2) : ""; }
function parseCents(v: string) { return Math.round(parseFloat(v || "0") * 100); }

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state mirrors product fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [type, setType] = useState<Product["type"]>("physical");
  const [status, setStatus] = useState<Product["status"]>("draft");
  const [sku, setSku] = useState("");
  const [categories, setCategories] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [stockTracking, setStockTracking] = useState(false);
  const [weight, setWeight] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [downloadFiles, setDownloadFiles] = useState<Array<{ name: string; url: string }>>([{ name: "", url: "" }]);

  const load = useCallback(async () => {
    const [pr, vr] = await Promise.all([
      fetch(`/api/products/${id}`),
      fetch(`/api/products/${id}/variants`),
    ]);
    if (!pr.ok) { toast.error("Product not found"); router.push("/admin/products"); return; }
    const p: Product = await pr.json();
    const v: Variant[] = vr.ok ? await vr.json() : [];
    setProduct(p);
    setVariants(v);
    setTitle(p.title);
    setSlug(p.slug);
    setDescription(p.description);
    setShortDesc(p.shortDescription ?? "");
    setType(p.type);
    setStatus(p.status);
    setSku(p.sku ?? "");
    setCategories(JSON.parse(p.categories).join(", "));
    setPrice(cents(p.price));
    setSalePrice(cents(p.salePrice));
    setStock(String(p.stock));
    setStockTracking(p.stockTracking);
    setWeight(p.weight ? String(p.weight) : "");
    const imgs: string[] = JSON.parse(p.images);
    setImages(imgs.length ? imgs : [""]);
    const files: Array<{ name: string; url: string }> = JSON.parse(p.downloadFiles);
    setDownloadFiles(files.length ? files : [{ name: "", url: "" }]);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, description, shortDescription: shortDesc || null,
        type, status, sku: sku || null,
        categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
        price: parseFloat(price || "0"),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock || "0"),
        stockTracking,
        weight: weight ? parseInt(weight) : null,
        images: images.filter(Boolean),
        downloadFiles: downloadFiles.filter((f) => f.url),
      }),
    });
    if (r.ok) toast.success("Product saved");
    else toast.error("Failed to save");
    setSaving(false);
  }

  async function saveVariants() {
    setSaving(true);
    const r = await fetch(`/api/products/${id}/variants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || undefined,
        price: v.price / 100,
        salePrice: v.salePrice != null ? v.salePrice / 100 : undefined,
        stock: v.stock,
        attributes: JSON.parse(v.attributes || "{}"),
      }))),
    });
    if (r.ok) toast.success("Variants saved");
    else toast.error("Failed to save variants");
    setSaving(false);
  }

  function addVariant() {
    setVariants((v) => [...v, { id: "", name: "", sku: "", price: 0, salePrice: null, stock: 0, attributes: "{}" }]);
  }

  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  function updateVariant(i: number, key: keyof Variant, val: string | number | null) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/products")} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <Package size={20} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title || "Untitled Product"}</h1>
            <p className="text-xs text-gray-400">/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
            status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
            {status}
          </span>
          {status === "published" && (
            <a href={`/products/${slug}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ExternalLink size={15} />
            </a>
          )}
          <button onClick={tab === "variants" ? saveVariants : save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.filter((t) => {
          if (t.key === "files") return type === "digital" || type === "variable";
          if (t.key === "variants") return type === "variable";
          return true;
        }).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* DETAILS TAB */}
        {tab === "details" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Title *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={title} onChange={(e) => { setTitle(e.target.value); if (!product || product.slug === slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Slug *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Product Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as Product["type"])}>
                  <option value="physical">Physical (shipped)</option>
                  <option value="digital">Digital (download)</option>
                  <option value="variable">Variable (sizes/colors)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Short Description</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Brief summary shown in product cards" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
              <textarea rows={6} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">SKU</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Categories (comma-separated)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Apparel, New Arrivals" value={categories} onChange={(e) => setCategories(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {tab === "pricing" && (
          <div className="flex flex-col gap-4 max-w-sm">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Price ($)</label>
              <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Sale Price ($) <span className="text-gray-400 font-normal">— optional</span></label>
              <input type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Leave blank for no sale" />
            </div>
            {type !== "digital" && (
              <>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="trackStock" checked={stockTracking} onChange={(e) => setStockTracking(e.target.checked)} className="w-4 h-4 rounded" />
                  <label htmlFor="trackStock" className="text-sm text-gray-700">Track stock quantity</label>
                </div>
                {stockTracking && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Stock Quantity</label>
                    <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Weight (grams) <span className="text-gray-400 font-normal">— for shipping</span></label>
                  <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* IMAGES TAB */}
        {tab === "images" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">Add image URLs. Use the Media Library to upload images, then paste the URL here.</p>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="https://... or /uploads/..." value={img}
                  onChange={(e) => setImages((arr) => arr.map((x, idx) => idx === i ? e.target.value : x))} />
                {img && <img src={img} alt="" className="w-10 h-10 rounded object-cover border" />}
                <button onClick={() => setImages((arr) => arr.filter((_, idx) => idx !== i))}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => setImages((a) => [...a, ""])} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Plus size={14} /> Add image
            </button>
          </div>
        )}

        {/* DIGITAL FILES TAB */}
        {tab === "files" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">Files customers receive after purchase. Each file needs a display name and a URL.</p>
            {downloadFiles.map((f, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex flex-col gap-1.5 flex-1">
                  <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="File name (e.g. Course PDF)" value={f.name}
                    onChange={(e) => setDownloadFiles((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                  <input className="border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://... or /uploads/..." value={f.url}
                    onChange={(e) => setDownloadFiles((arr) => arr.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} />
                </div>
                <button onClick={() => setDownloadFiles((arr) => arr.filter((_, idx) => idx !== i))}
                  className="mt-1 p-2 hover:bg-red-50 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => setDownloadFiles((a) => [...a, { name: "", url: "" }])} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Plus size={14} /> Add file
            </button>
          </div>
        )}

        {/* VARIANTS TAB */}
        {tab === "variants" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">Define size/color/style variants. Each variant has its own price and stock.</p>
            {variants.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">No variants yet</p>
            )}
            {variants.map((v, i) => (
              <div key={i} className="border rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Variant {i + 1}</span>
                  <button onClick={() => removeVariant(i)} className="p-1 hover:bg-red-50 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Name *</label>
                    <input className="w-full border rounded px-2 py-1.5 text-sm" placeholder="e.g. Small / Red"
                      value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">SKU</label>
                    <input className="w-full border rounded px-2 py-1.5 text-sm font-mono"
                      value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Price ($)</label>
                    <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1.5 text-sm"
                      value={cents(v.price)} onChange={(e) => updateVariant(i, "price", parseCents(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Sale Price ($)</label>
                    <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1.5 text-sm"
                      value={cents(v.salePrice)} onChange={(e) => updateVariant(i, "salePrice", e.target.value ? parseCents(e.target.value) : null)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Stock</label>
                    <input type="number" min="0" className="w-full border rounded px-2 py-1.5 text-sm"
                      value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value || "0"))} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addVariant} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Plus size={14} /> Add variant
            </button>
            <div className="pt-2 border-t">
              <button onClick={saveVariants} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Variants
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
