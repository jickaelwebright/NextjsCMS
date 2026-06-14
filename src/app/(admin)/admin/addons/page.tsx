"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle, Loader2, Puzzle } from "lucide-react";
import { toast } from "sonner";

interface AddonItem {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  version: string;
  enabled: boolean;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/addons");
    if (r.ok) setAddons(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(name: string, currentlyEnabled: boolean) {
    setToggling(name);
    const action = currentlyEnabled ? "disable" : "enable";
    const r = await fetch("/api/addons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, action }),
    });
    if (r.ok) {
      toast.success(action === "enable" ? `${name} addon enabled` : `${name} addon disabled`);
      if (action === "enable") {
        toast.info("Reload the page to see new menu items", { duration: 4000 });
      }
      await load();
    } else {
      toast.error("Failed to toggle addon");
    }
    setToggling(null);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Puzzle size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Extend your site with optional features. Disabled addons add no overhead — tables and menus only appear after activation.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {addons.map((addon) => (
            <div
              key={addon.name}
              className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-shadow hover:shadow-sm ${
                addon.enabled ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
              }`}
            >
              <div className={`p-2 rounded-lg ${addon.enabled ? "bg-blue-100" : "bg-gray-100"}`}>
                <ShoppingBag size={24} className={addon.enabled ? "text-blue-600" : "text-gray-400"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{addon.displayName}</h3>
                  <span className="text-xs text-gray-400">v{addon.version}</span>
                  {addon.enabled && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle size={11} /> Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{addon.description}</p>
              </div>
              <button
                onClick={() => toggle(addon.name, addon.enabled)}
                disabled={toggling === addon.name}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  addon.enabled
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {toggling === addon.name && <Loader2 size={13} className="animate-spin" />}
                {addon.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
