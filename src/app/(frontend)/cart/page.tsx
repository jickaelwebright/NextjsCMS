"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQty } = useCart();
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-50" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">📦</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-gray-500">${(item.price / 100).toFixed(2)} each</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-gray-50">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-gray-50">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold text-gray-900">${((item.price * item.qty) / 100).toFixed(2)}</span>
                <button onClick={() => removeItem(item.productId, item.variantId)}
                  className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-gray-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span><span>${(total / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Shipping</span><span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-3 border-t mb-5">
            <span>Total</span><span>${(total / 100).toFixed(2)}</span>
          </div>
          <Link href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Checkout <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
