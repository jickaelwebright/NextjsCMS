"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useUIStore } from "@/builder/store/uiStore";
import { cn } from "@/lib/utils";
import type { PreviewDevice } from "@/types/builder";

const DEVICES: { id: PreviewDevice; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet",  icon: Tablet },
  { id: "mobile",  icon: Smartphone },
];

export function DevicePreviewToggle() {
  const { previewDevice, setPreviewDevice } = useUIStore();
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
      {DEVICES.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setPreviewDevice(id)}
          title={id}
          className={cn(
            "p-1.5 rounded transition-colors",
            previewDevice === id
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
