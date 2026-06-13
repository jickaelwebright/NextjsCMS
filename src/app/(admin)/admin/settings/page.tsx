"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save, Eye, EyeOff, ExternalLink } from "lucide-react";

type Tab = "site" | "header" | "footer" | "ai";

interface AISettings {
  ai_openai_key: string;
  ai_openrouter_key: string;
  ai_nim_key: string;
  ai_gemini_key: string;
}

function MaskedInput({
  label,
  value,
  onChange,
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helpText?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("site");

  // AI settings
  const [aiKeys, setAiKeys] = useState<AISettings>({
    ai_openai_key: "",
    ai_openrouter_key: "",
    ai_nim_key: "",
    ai_gemini_key: "",
  });
  const [savingAI, setSavingAI] = useState(false);
  const [loadedAI, setLoadedAI] = useState(false);

  useEffect(() => {
    if (tab === "ai" && !loadedAI) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data: Record<string, string>) => {
          setAiKeys({
            ai_openai_key: data.ai_openai_key ?? "",
            ai_openrouter_key: data.ai_openrouter_key ?? "",
            ai_nim_key: data.ai_nim_key ?? "",
            ai_gemini_key: data.ai_gemini_key ?? "",
          });
          if (data.siteName) setSiteName(data.siteName);
          setLoadedAI(true);
        })
        .catch(() => {});
    }
  }, [tab, loadedAI]);

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

  async function saveAISettings() {
    setSavingAI(true);
    // Only send non-empty keys to avoid overwriting with empty string
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(aiKeys)) {
      if (v.trim()) payload[k] = v.trim();
    }
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    toast.success("AI keys saved");
    setSavingAI(false);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "site", label: "Site Settings" },
    { id: "header", label: "Header Editor" },
    { id: "footer", label: "Footer Editor" },
    { id: "ai", label: "AI Integration" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Site Settings */}
      {tab === "site" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Site Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="My Site"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} /> Save Settings
          </button>
        </div>
      )}

      {/* Header / Footer editors */}
      {(tab === "header" || tab === "footer") && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Build your site {tab} using the visual editor.
          </p>
          <Link
            href={`/admin/builder/global-${tab}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Edit {tab.charAt(0).toUpperCase() + tab.slice(1)} in Builder →
          </Link>
        </div>
      )}

      {/* AI Integration */}
      {tab === "ai" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">AI Page Generator</h2>
            <p className="text-sm text-gray-500">
              Add API keys for the providers you want to use. Keys are encrypted and stored in your
              tenant database — never shared or sent to third parties. You only need one provider to get started.
            </p>
          </div>

          <MaskedInput
            label="OpenAI API Key"
            value={aiKeys.ai_openai_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_openai_key: v }))}
            placeholder="sk-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  platform.openai.com <ExternalLink size={10} />
                </a>
                . Models: GPT-4o, GPT-4o Mini.
              </>
            }
          />

          <MaskedInput
            label="OpenRouter API Key"
            value={aiKeys.ai_openrouter_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_openrouter_key: v }))}
            placeholder="sk-or-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  openrouter.ai <ExternalLink size={10} />
                </a>
                . Includes free-tier models (Gemini Flash, Llama 3.3, Mistral).
              </>
            }
          />

          <MaskedInput
            label="NVIDIA NIM API Key"
            value={aiKeys.ai_nim_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_nim_key: v }))}
            placeholder="nvapi-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  build.nvidia.com <ExternalLink size={10} />
                </a>
                . Free trial credits included. Models: Llama 3.3, Nemotron.
              </>
            }
          />

          <MaskedInput
            label="Google Gemini API Key"
            value={aiKeys.ai_gemini_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_gemini_key: v }))}
            placeholder="AIza..."
            helpText={
              <>
                Get a free key at{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  aistudio.google.com <ExternalLink size={10} />
                </a>
                . Gemini 2.0 Flash is fast and free-tier eligible.
              </>
            }
          />

          <button
            onClick={saveAISettings}
            disabled={savingAI}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} />
            {savingAI ? "Saving…" : "Save AI Keys"}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>How to use:</strong> In the page builder, click the{" "}
            <strong>✦ AI</strong> tab in the left panel, describe your page, choose a provider and
            model, then click <strong>Generate Full Page</strong> or <strong>Add Section</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
