"use client";

export function DropIndicator({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return (
    <div className="h-1 bg-blue-500 rounded-full mx-2 my-0.5 opacity-80 animate-pulse" />
  );
}
