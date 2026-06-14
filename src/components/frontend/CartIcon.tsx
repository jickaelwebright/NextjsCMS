"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart, cartCount } from "@/lib/cartStore";

export function CartIcon() {
  const { items } = useCart();
  const count = cartCount(items);
  return (
    <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg" aria-label="Cart">
      <ShoppingCart size={20} className="text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
