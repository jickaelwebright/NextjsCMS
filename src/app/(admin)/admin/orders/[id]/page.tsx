"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderItem { productId: string; name: string; qty: number; price: number; variantId?: string; }
interface Order {
  id: string; orderNumber: string; status: string; customerName: string;
  customerEmail: string; billingAddress: string; shippingAddress: string;
  items: string; subtotal: number; shippingCost: number; tax: number; total: number;
  paymentMethod: string | null; paymentStatus: string; paymentRef: string | null;
  notes: string | null; createdAt: string | number;
}

const STATUSES = ["pending", "processing", "completed", "cancelled", "refunded"] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

function fmtPrice(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
function fmtDate(ts: string | number) {
  return new Date(typeof ts === "number" ? ts * 1000 : ts).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/orders/${id}`);
    if (!r.ok) { toast.error("Order not found"); router.push("/admin/orders"); return; }
    const o: Order = await r.json();
    setOrder(o);
    setStatus(o.status);
    setNotes(o.notes ?? "");
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    if (r.ok) toast.success("Order updated");
    else toast.error("Failed to update");
    setSaving(false);
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-gray-400" /></div>;
  if (!order) return null;

  const billing = JSON.parse(order.billingAddress) as Record<string, string>;
  const shipping = JSON.parse(order.shippingAddress) as Record<string, string>;
  const items: OrderItem[] = JSON.parse(order.items);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/orders")} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <ShoppingCart size={20} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-xs text-gray-400">{fmtDate(order.createdAt)}</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left column — items + totals */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Items</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <tr key={i} className="px-4">
                    <td className="px-4 py-3 flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.variantId && <p className="text-xs text-gray-400">Variant: {item.variantId}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-right">×{item.qty}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmtPrice(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmtPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{fmtPrice(order.shippingCost)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>{fmtPrice(order.tax)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100"><span>Total</span><span>{fmtPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                {order.paymentStatus}
              </span>
              {order.paymentMethod && <span className="text-gray-500 capitalize">{order.paymentMethod}</span>}
              {order.paymentRef && <span className="text-gray-400 font-mono text-xs">{order.paymentRef}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Internal Notes</h2>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes visible only to admin..." />
          </div>
        </div>

        {/* Right column — status + addresses */}
        <div className="flex flex-col gap-5">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Status</h2>
            <div className="mb-3">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600")}>
                Current: {order.status}
              </span>
            </div>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Customer</h2>
            <p className="text-sm text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.customerEmail}</p>
          </div>

          {/* Billing */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Billing Address</h2>
            <address className="text-sm text-gray-600 not-italic leading-relaxed">
              {billing.address && <p>{billing.address}</p>}
              {billing.city && <p>{billing.city}{billing.state ? `, ${billing.state}` : ""} {billing.postcode}</p>}
              {billing.country && <p>{billing.country}</p>}
            </address>
          </div>

          {/* Shipping */}
          {shipping.address && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Shipping Address</h2>
              <address className="text-sm text-gray-600 not-italic leading-relaxed">
                {shipping.address && <p>{shipping.address}</p>}
                {shipping.city && <p>{shipping.city}{shipping.state ? `, ${shipping.state}` : ""} {shipping.postcode}</p>}
                {shipping.country && <p>{shipping.country}</p>}
              </address>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
