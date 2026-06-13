"use client";

import { useUIStore } from "@/builder/store/uiStore";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { PreviewDevice } from "@/types/builder";

const DEVICES: { id: PreviewDevice; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet",  icon: Tablet },
  { id: "mobile",  icon: Smartphone },
];

export function ResponsiveTabs({ children }: { children: React.ReactNode }) {
  const { previewDevice, setPreviewDevice } = useUIStore();
  return (
    <div>
      <div className="flex gap-1 mb-3 p-1 bg-gray-100 rounded">
        {DEVICES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPreviewDevice(id)}
            className={`flex-1 flex items-center justify-center py-1 rounded transition-colors text-xs ${
              previewDevice === id ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
