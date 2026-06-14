"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string; orderNumber: string; status: string; customerName: string;
  customerEmail: string; total: number; paymentStatus: string;
  createdAt: string; itemCount?: number;
}

const STATUS_TABS = ["all", "pending", "processing", "completed", "cancelled", "refunded"] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>("all");

  useEffect(() => {
    setLoading(true);
    fetch(tab === "all" ? "/api/orders" : `/api/orders?status=${tab}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setOrders(data); setLoading(false); });
  }, [tab]);

  function fmtPrice(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
  function fmtDate(ts: string | number) {
    return new Date(typeof ts === "number" ? ts * 1000 : ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {STATUS_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors -mb-px",
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{o.customerName}</p>
                    <p className="text-xs text-gray-400">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600")}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/admin/orders/${o.id}`)}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
