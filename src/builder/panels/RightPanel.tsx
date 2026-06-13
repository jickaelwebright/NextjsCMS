"use client";

import { PropertiesPanel } from "./properties/PropertiesPanel";

export function RightPanel() {
  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      <PropertiesPanel />
    </div>
  );
}
