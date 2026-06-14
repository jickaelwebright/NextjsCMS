"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("number");

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      {orderNumber && (
        <p className="text-gray-500 mb-1">
          Order <span className="font-mono font-semibold text-gray-700">{orderNumber}</span>
        </p>
      )}
      <p className="text-gray-500 mb-8">
        Thank you for your purchase. You will receive an email confirmation shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
