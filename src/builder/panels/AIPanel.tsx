"use client";

import { useState, useEffect } from "react";
import { useBuilderStore } from "@/builder/store/builderStore";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus, AlertTriangle, ExternalLink } from "lucide-react";
import { rehydrateDocumentIds, rehydrateSectionIds } from "@/lib/utils";
import type { PageDocument, Section } from "@/types/page";
import type { AIProvider } from "@/lib/aiService";

// ─── Provider / model options ─────────────────────────────────────────────────

type ModelOption = { value: string; label: string; free?: boolean };

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "nvidia-nim", label: "NVIDIA NIM" },
  { value: "gemini", label: "Google Gemini" },
  { value: "ollama", label: "Ollama (local)" },
];

const MODELS: Record<AIProvider, ModelOption[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (fast)" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  openrouter: [
    { value: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash", free: true },
    { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", free: true },
    { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 24B", free: true },
    { value: "qwen/qwen3-235b-a22b:free", label: "Qwen3 235B", free: true },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "google/gemini-flash-1.5", label: "Gemini 1.5 Flash" },
    { value: "anthropic/claude-3-5-haiku", label: "Claude 3.5 Haiku" },
  ],
  "nvidia-nim": [
    { value: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
    { value: "nvidia/llama-3.1-nemotron-ultra-253b-v1", label: "Nemotron Ultra 253B" },
    { value: "mistralai/mistral-small-24b-instruct-2501", label: "Mistral Small 24B" },
    { value: "google/gemma-3-27b-it", label: "Gemma 3 27B" },
  ],
  gemini: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (fastest)" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  ollama: [
    { value: "llama3.2", label: "Llama 3.2" },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "mistral", label: "Mistral" },
    { value: "gemma3", label: "Gemma 3" },
  ],
};

const CUSTOM_MODEL_KEYS: [AIProvider, string][] = [
  ["openai", "ai_openai_custom_models"],
  ["openrouter", "ai_openrouter_custom_models"],
  ["nvidia-nim", "ai_nim_custom_models"],
  ["gemini", "ai_gemini_custom_models"],
  ["ollama", "ai_ollama_custom_models"],
];

const EXAMPLE_PROMPTS = [
  "Landing page for a fitness studio with hero, class schedule, trainer profiles, and contact form",
  "SaaS product page with hero, 3 key features, pricing table (3 tiers), and FAQ section",
  "Restaurant website with hero, menu highlights, about section, gallery placeholder, and reservation form",
  "Professional services page for a law firm with hero, practice areas, team bios, and consultation form",
  "E-commerce product landing page with hero, product features, testimonials, and CTA",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AIPanel() {
  const { document: storeDoc, setDocument, addSection, markDirty } = useBuilderStore();

  const [provider, setProvider] = useState<AIProvider>("openrouter");
  const [model, setModel] = useState<string>("google/gemini-2.0-flash-exp:free");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [missingKey, setMissingKey] = useState(false);

  const [configuredProviders, setConfiguredProviders] = useState<Set<AIProvider>>(new Set());
  const [customModels, setCustomModels] = useState<Record<string, string[]>>({});
  const [providersLoaded, setProvidersLoaded] = useState(false);

  useEffect(() => {
    const keys = [
      "ai_openai_key", "ai_openrouter_key", "ai_nim_key", "ai_gemini_key", "ai_ollama_url",
      ...CUSTOM_MODEL_KEYS.map(([, k]) => k),
    ].join(",");

    fetch(`/api/settings?keys=${keys}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const configured = new Set<AIProvider>();
        if (data.ai_openai_key?.trim()) configured.add("openai");
        if (data.ai_openrouter_key?.trim()) configured.add("openrouter");
        if (data.ai_nim_key?.trim()) configured.add("nvidia-nim");
        if (data.ai_gemini_key?.trim()) configured.add("gemini");
        if (data.ai_ollama_url?.trim()) configured.add("ollama");
        setConfiguredProviders(configured);

        const custom: Record<string, string[]> = {};
        for (const [p, k] of CUSTOM_MODEL_KEYS) {
          try { custom[p] = JSON.parse(data[k] ?? "[]"); } catch { custom[p] = []; }
        }
        setCustomModels(custom);

        if (configured.size > 0) {
          const first = [...configured][0];
          setProvider(first);
          setModel(MODELS[first][0]?.value ?? "");
        }
        setProvidersLoaded(true);
      })
      .catch(() => setProvidersLoaded(true));
  }, []);

  const filteredProviders =
    providersLoaded && configuredProviders.size > 0
      ? PROVIDERS.filter((p) => configuredProviders.has(p.value))
      : PROVIDERS;

  const allModels: ModelOption[] = [
    ...(MODELS[provider] ?? []),
    ...(customModels[provider] ?? []).map((v) => ({ value: v, label: v })),
  ];

  const noProviders = providersLoaded && configuredProviders.size === 0;

  function handleProviderChange(p: AIProvider) {
    setProvider(p);
    setModel(MODELS[p][0]?.value ?? "");
    setMissingKey(false);
  }

  async function generate(mode: "page" | "section") {
    if (!prompt.trim()) {
      toast.error("Describe the page or section first.");
      return;
    }
    setLoading(true);
    setMissingKey(false);
    try {
      const res = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), provider, model, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.missingKey) {
          setMissingKey(true);
          toast.error("API key missing — see Settings → AI Integration");
        } else {
          toast.error(data.error ?? "Generation failed");
        }
        return;
      }

      if (mode === "page") {
        const doc = rehydrateDocumentIds(data.result as PageDocument);
        if (storeDoc?.meta?.slug) doc.meta.slug = storeDoc.meta.slug;
        if (storeDoc?.meta?.title) doc.meta.title = storeDoc.meta.title;
        setDocument(doc);
        markDirty();
        toast.success("Page generated! Review and save.");
      } else {
        const section = rehydrateSectionIds(data.result as Section);
        addSection(section);
        toast.success("Section added to page.");
      }
    } catch {
      toast.error("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 py-1">
        <Sparkles size={15} className="text-indigo-500" />
        <span className="text-sm font-semibold text-gray-800">AI Page Builder</span>
      </div>

      {/* No providers configured notice */}
      {noProviders && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            No AI providers configured.{" "}
            <a href="/admin/settings" className="underline font-medium inline-flex items-center gap-0.5">
              Go to Settings <ExternalLink size={10} />
            </a>{" "}
            → AI Integration to add an API key or Ollama URL.
          </div>
        </div>
      )}

      {/* Provider */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Provider</label>
        <select
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
        >
          {filteredProviders.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Model</label>
        <select
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {allModels.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}{m.free ? " ✦ free" : ""}
            </option>
          ))}
        </select>
        {provider === "openrouter" && (
          <p className="text-xs text-gray-400 mt-1">
            Models marked ✦ free have no per-token cost on OpenRouter.
          </p>
        )}
        {provider === "ollama" && (
          <p className="text-xs text-gray-400 mt-1">
            Run <code className="bg-gray-100 px-1 rounded">ollama pull &lt;model&gt;</code> to install.
            Add custom model IDs in Settings → AI Integration.
          </p>
        )}
      </div>

      {/* Missing key warning */}
      {missingKey && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            No API key for {provider}.{" "}
            <a href="/admin/settings" className="underline font-medium inline-flex items-center gap-0.5">
              Go to Settings <ExternalLink size={10} />
            </a>{" "}
            → AI Integration to add your key.
          </div>
        </div>
      )}

      {/* Prompt */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Describe your page</label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[90px]"
          placeholder="e.g. Landing page for a yoga studio with a hero section, 3 class types, instructor profiles, and a booking form"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => generate("page")}
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Generate Full Page
        </button>

        <button
          onClick={() => generate("section")}
          disabled={loading || !prompt.trim() || !storeDoc}
          title={!storeDoc ? "Load a page first" : undefined}
          className="w-full flex items-center justify-center gap-2 py-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Section
        </button>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Example prompts */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Example prompts</p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setPrompt(ex)}
              className="text-left text-xs text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded px-2 py-1.5 transition-colors line-clamp-2"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Footer tip */}
      <p className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
        Generated pages replace the current canvas. Save first if you have unsaved changes.
      </p>
    </div>
  );
}
