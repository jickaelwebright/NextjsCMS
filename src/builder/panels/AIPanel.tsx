"use client";

import { useState } from "react";
import { useBuilderStore } from "@/builder/store/builderStore";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";
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
};

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

  // Sync model when provider changes
  function handleProviderChange(p: AIProvider) {
    setProvider(p);
    setModel(MODELS[p][0].value);
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
        // Preserve original slug/title — AI changes content, not page identity
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

      {/* Provider */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1">Provider</label>
        <select
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
        >
          {PROVIDERS.map((p) => (
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
          {MODELS[provider].map((m) => (
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
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
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
