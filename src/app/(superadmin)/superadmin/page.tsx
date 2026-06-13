"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Globe, Pause, Play, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Tenant {
  id: string; name: string; slug: string; adminEmail: string;
  plan: string; customDomain?: string; createdAt: string;
}

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", adminPassword: "", customDomain: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/tenants");
    if (r.ok) setTenants(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createTenant() {
    setCreating(true);
    const r = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      toast.success(`Site "${form.name}" created`);
      setShowNew(false);
      setForm({ name: "", slug: "", adminEmail: "", adminPassword: "", customDomain: "" });
      load();
    } else {
      const e = await r.json();
      toast.error(JSON.stringify(e.error));
    }
    setCreating(false);
  }

  async function togglePlan(id: string, currentPlan: string) {
    const action = currentPlan === "active" ? "suspend" : "activate";
    await fetch(`/api/tenants/${id}/${action}`, { method: "POST" });
    toast.success(action === "suspend" ? "Suspended" : "Activated");
    load();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Sites</h1>
        <div className="flex gap-2">
          <Link href="/setup" className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Settings size={14} /> Setup
          </Link>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> New Site
          </button>
        </div>
      </div>

      {/* New Tenant Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create New Client Site</h2>
            <div className="flex flex-col gap-3">
              {[
                { key: "name",          label: "Site Name",       type: "text",     placeholder: "Acme Corp" },
                { key: "slug",          label: "Site ID (slug)",  type: "text",     placeholder: "acme" },
                { key: "adminEmail",    label: "Admin Email",     type: "email",    placeholder: "admin@acme.com" },
                { key: "adminPassword", label: "Admin Password",  type: "password", placeholder: "min 8 chars" },
                { key: "customDomain",  label: "Custom Domain",   type: "text",     placeholder: "acme.com (optional)" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 block mb-1">{label}</label>
                  <input type={type} className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={(form as any)[key]}
                    onChange={(e) => {
                      const v = key === "slug" ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") : e.target.value;
                      setForm((f) => ({ ...f, [key]: v }));
                    }}
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={createTenant} disabled={!form.name || !form.slug || !form.adminEmail || !form.adminPassword || creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : null} Create Site
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No client sites yet. Create the first one.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {tenants.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">ID: {t.slug} · {t.adminEmail}</p>
                {t.customDomain && <p className="text-xs text-blue-500">{t.customDomain}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.plan === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {t.plan}
                </span>
                <a href={`/?tenant=${t.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline px-2">View</a>
                <button onClick={() => togglePlan(t.id, t.plan)} title={t.plan === "active" ? "Suspend" : "Activate"}
                  className="p-1.5 hover:bg-gray-100 rounded">
                  {t.plan === "active" ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
