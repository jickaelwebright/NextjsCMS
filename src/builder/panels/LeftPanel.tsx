"use client";

import { useUIStore } from "@/builder/store/uiStore";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { LayersTree } from "./layers/LayersTree";
import { Layers, Puzzle } from "lucide-react";

export function LeftPanel() {
  const { activeLeftTab, setActiveLeftTab } = useUIStore();

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveLeftTab("widgets")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeLeftTab === "widgets"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Puzzle size={14} /> Widgets
        </button>
        <button
          onClick={() => setActiveLeftTab("layers")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeLeftTab === "layers"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Layers size={14} /> Layers
        </button>
      </div>
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeLeftTab === "widgets" ? <ComponentLibrary /> : <LayersTree />}
      </div>
    </div>
  );
}
