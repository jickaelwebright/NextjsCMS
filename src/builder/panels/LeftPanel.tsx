"use client";

import { useUIStore } from "@/builder/store/uiStore";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { LayersTree } from "./layers/LayersTree";
import { AIPanel } from "./AIPanel";
import { Layers, Puzzle, Sparkles } from "lucide-react";

const TABS = [
  { id: "widgets", label: "Widgets", Icon: Puzzle },
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "ai", label: "AI", Icon: Sparkles },
] as const;

export function LeftPanel() {
  const { activeLeftTab, setActiveLeftTab } = useUIStore();

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveLeftTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activeLeftTab === id
                ? id === "ai"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeLeftTab === "widgets" && <ComponentLibrary />}
        {activeLeftTab === "layers" && <LayersTree />}
        {activeLeftTab === "ai" && <AIPanel />}
      </div>
    </div>
  );
}
