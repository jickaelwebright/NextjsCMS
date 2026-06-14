"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cartStore";

interface Props {
  product: { id: string; title: string; slug: string; price: number; image?: string };
  variants: Array<{ id: string; name: string; price: number; stock: number }>;
  type: string;
  stockTracking: boolean;
  stock: number;
}

export function AddToCartButton({ product, variants, type, stockTracking, stock }: Props) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id ?? "");

  const outOfStock = stockTracking && stock <= 0 && !variants.length;
  const effectivePrice = variants.length
    ? (variants.find((v) => v.id === selectedVariant)?.price ?? product.price)
    : product.price;

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: selectedVariant || undefined,
      qty: 1,
      price: effectivePrice,
      name: product.title + (selectedVariant ? ` — ${variants.find((v) => v.id === selectedVariant)?.name ?? ""}` : ""),
      image: product.image,
    });
    toast.success("Added to cart");
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Option</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — ${(v.price / 100).toFixed(2)}
                {v.stock <= 0 ? " (Out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ShoppingCart size={18} />
        {outOfStock ? "Out of Stock" : type === "digital" ? "Buy Now" : "Add to Cart"}
      </button>
    </div>
  );
}
