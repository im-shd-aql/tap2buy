"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productPrice: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: string;
  serviceFee: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
  pending: { next: "confirmed", label: "Confirm Order" },
  confirmed: { next: "shipped", label: "Mark Shipped" },
  shipped: { next: "delivered", label: "Mark Delivered" },
};

const STATUS_FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !store) return;
    setLoading(true);
    const query = filter === "all" ? "" : `?status=${filter}`;
    api
      .get<{ orders: Order[] }>(`/api/orders/store/${store.id}${query}`, { token })
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, store, filter]);

  async function updateStatus(orderId: string, status: string) {
    if (!token) return;
    try {
      await api.put(`/api/orders/${orderId}/status`, { status }, { token });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
      if (selected?.id === orderId) {
        setSelected({ ...selected, orderStatus: status });
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function markCodCollected(orderId: string) {
    if (!token) return;
    try {
      await api.post(`/api/orders/${orderId}/cod-collected`, {}, { token });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "paid" } : o))
      );
      if (selected?.id === orderId) {
        setSelected({ ...selected, paymentStatus: "paid" });
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Mobile: show detail as full screen overlay
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="bg-white rounded-xl border p-4 sm:p-5">
          <h2 className="font-bold text-lg mb-4">{selected.orderNumber}</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Customer</p>
              <p className="font-medium">{selected.buyerName}</p>
              <div className="flex items-center gap-3 mt-1">
                <a href={`tel:${selected.buyerPhone}`} className="text-indigo-600 text-sm">
                  {selected.buyerPhone}
                </a>
                <a
                  href={`https://wa.me/${selected.buyerPhone.replace(/^0/, "94").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selected.buyerName}, regarding your order ${selected.orderNumber} from Tap2Buy`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-full font-medium active:scale-[0.96] transition-transform"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="break-words">{selected.buyerAddress}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Items</p>
              <div className="space-y-1.5">
                {selected.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="flex-1 min-w-0 truncate mr-2">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="whitespace-nowrap">
                      LKR {(Number(item.productPrice) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>LKR {Number(selected.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Service fee</span>
                <span>LKR {Number(selected.serviceFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-1.5">
                <span>Total</span>
                <span>LKR {Number(selected.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  selected.orderStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : selected.orderStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : selected.orderStatus === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {selected.orderStatus}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  selected.paymentMethod === "cod"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {selected.paymentMethod.toUpperCase()}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  selected.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {selected.paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {STATUS_ACTIONS[selected.orderStatus] && (
              <button
                onClick={() =>
                  updateStatus(selected.id, STATUS_ACTIONS[selected.orderStatus].next)
                }
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-[0.98] transition-transform"
              >
                {STATUS_ACTIONS[selected.orderStatus].label}
              </button>
            )}
            {selected.paymentMethod === "cod" &&
              selected.paymentStatus !== "paid" &&
              selected.orderStatus === "delivered" && (
                <button
                  onClick={() => markCodCollected(selected.id)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 active:scale-[0.98] transition-transform"
                >
                  Payment Collected (COD)
                </button>
              )}
            {selected.orderStatus === "pending" && (
              <button
                onClick={() => updateStatus(selected.id, "cancelled")}
                className="w-full py-3 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 active:scale-[0.98] transition-transform"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-5">Orders</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-2 text-sm rounded-full whitespace-nowrap ${
              filter === s
                ? "bg-indigo-600 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No orders found</div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="w-full text-left p-4 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{order.buyerName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-medium text-sm">
                      LKR {Number(order.total).toLocaleString()}
                    </p>
                    <div className="flex gap-1 mt-1 justify-end flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.paymentMethod === "cod"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {order.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
