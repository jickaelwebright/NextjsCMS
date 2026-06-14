"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartStore";
import { toast } from "sonner";

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
      redirect: "if_required",
    });
    if (error) {
      toast.error(error.message ?? "Payment failed");
      setLoading(false);
    } else {
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Payment Details</h2>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}
        className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
        Pay Now
      </button>
    </form>
  );
}

function PaymentPageContent() {
  const params = useSearchParams();
  const clientSecret = params.get("secret");
  const orderId = params.get("orderId") ?? "";
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) setStripePromise(loadStripe(key));
  }, []);

  if (!clientSecret || !stripePromise) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Loader2 className="animate-spin mx-auto text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete Payment</h1>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <PaymentForm orderId={orderId} />
      </Elements>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-24 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
