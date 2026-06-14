"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart, cartTotal } from "@/lib/cartStore";
import { toast } from "sonner";

interface BillingForm {
  name: string; email: string; address: string; city: string;
  state: string; postcode: string; country: string;
}

const EMPTY: BillingForm = { name: "", email: "", address: "", city: "", state: "", postcode: "", country: "AU" };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const total = cartTotal(items);
  const [billing, setBilling] = useState<BillingForm>(EMPTY);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-blue-600 hover:underline">Browse products</Link>
      </div>
    );
  }

  function update(key: keyof BillingForm, value: string) {
    setBilling((b) => ({ ...b, [key]: value }));
  }

  function valid() {
    return billing.name && billing.email && billing.address && billing.city && billing.postcode;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: items, billing }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error ?? "Checkout failed"); setLoading(false); return; }

      if (data.requiresPayment && data.clientSecret) {
        // Stripe Elements flow
        router.push(`/checkout/payment?orderId=${data.orderId}&secret=${encodeURIComponent(data.clientSecret)}`);
      } else {
        // Manual order (no Stripe configured)
        clearCart();
        router.push(`/checkout/success?orderId=${data.orderId}&number=${data.orderNumber}`);
      }
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  const Field = ({ label, name, type = "text", required = false, placeholder = "" }: { label: string; name: keyof BillingForm; type?: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} required={required} placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={billing[name]} onChange={(e) => update(name, e.target.value)} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" name="name" required />
              <Field label="Email Address" name="email" type="email" required />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Billing Address</h2>
            <div className="flex flex-col gap-3">
              <Field label="Street Address" name="address" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" name="city" required />
                <Field label="State / Region" name="state" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postcode / ZIP" name="postcode" required />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Country</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={billing.country} onChange={(e) => update("country", e.target.value)}>
                    <option value="AU">Australia</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="NZ">New Zealand</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex flex-col gap-2 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm text-gray-700">
                  <span className="truncate flex-1">{item.name} ×{item.qty}</span>
                  <span className="ml-2 font-medium">${((item.price * item.qty) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span><span>${(total / 100).toFixed(2)}</span>
            </div>
            <button type="submit" disabled={!valid() || loading}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Place Order
            </button>
            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock size={10} /> Secure checkout
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
