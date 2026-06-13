"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"site" | "header" | "footer">("site");

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteName }),
    });
    toast.success("Settings saved");
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["site", "header", "footer"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "site" ? "Site Settings" : `${t.charAt(0).toUpperCase() + t.slice(1)} Editor`}
          </button>
        ))}
      </div>

      {tab === "site" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Site Name</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My Site" />
          </div>
          <button onClick={saveSettings} disabled={saving}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Save size={14} /> Save Settings
          </button>
        </div>
      )}

      {(tab === "header" || tab === "footer") && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Build your site {tab} using the visual editor.
          </p>
          <Link href={`/admin/builder/global-${tab}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Edit {tab.charAt(0).toUpperCase() + tab.slice(1)} in Builder →
          </Link>
        </div>
      )}
    </div>
  );
}
