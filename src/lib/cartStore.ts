"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  qty: number;
  price: number;
  name: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clearCart: () => void;
}

function sameItem(a: CartItem, b: { productId: string; variantId?: string }) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => sameItem(i, item));
          if (existing) {
            return { items: s.items.map((i) => sameItem(i, item) ? { ...i, qty: i.qty + item.qty } : i) };
          }
          return { items: [...s.items, item] };
        }),
      removeItem: (productId, variantId) =>
        set((s) => ({ items: s.items.filter((i) => !sameItem(i, { productId, variantId })) })),
      updateQty: (productId, variantId, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => !sameItem(i, { productId, variantId }))
            : s.items.map((i) => sameItem(i, { productId, variantId }) ? { ...i, qty } : i),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart" }
  )
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
