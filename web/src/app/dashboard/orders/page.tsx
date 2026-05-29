"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { ArrowLeft, MessageCircle, Phone, X, Share2, Eye, CheckCircle, XCircle } from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: string;
  quantity: number;
  variant?: any;
  product?: { images: string[] };
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
  bookingFee: string | null;
  paymentSlipUrl: string | null;
  paymentSlipNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const STATUS_BG: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const ACTION_BUTTONS: Record<string, { next: string; label: string; color: string }> = {
  pending: { next: "confirmed", label: "Confirm Order", color: "bg-blue-600 hover:bg-blue-700" },
  confirmed: { next: "shipped", label: "Mark Shipped", color: "bg-purple-600 hover:bg-purple-700" },
  shipped: { next: "delivered", label: "Mark Delivered", color: "bg-green-600 hover:bg-green-700" },
};

export default function OrdersPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingSlip, setViewingSlip] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Handle filter from URL query (from action items)
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    if (urlFilter && STATUS_FILTERS.includes(urlFilter)) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  // Handle pre-selected order from URL
  useEffect(() => {
    const orderId = searchParams.get("id");
    if (orderId && orders.length > 0) {
      const found = orders.find((o) => o.id === orderId);
      if (found) setSelected(found);
    }
  }, [searchParams, orders]);

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

  async function confirmPayment(orderId: string) {
    if (!token) return;
    try {
      await api.post(`/api/orders/${orderId}/confirm-payment`, {}, { token });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "paid", rejectionReason: null } : o))
      );
      if (selected?.id === orderId) {
        setSelected({ ...selected, paymentStatus: "paid", rejectionReason: null });
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function rejectPayment(orderId: string, reason: string) {
    if (!token) return;
    try {
      await api.post(`/api/orders/${orderId}/reject-payment`, { reason }, { token });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "failed", rejectionReason: reason } : o))
      );
      if (selected?.id === orderId) {
        setSelected({ ...selected, paymentStatus: "failed", rejectionReason: reason });
      }
      setRejectingPayment(false);
      setRejectionReason("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function shareStore() {
    if (!store) return;
    const url = `https://tap2buy.lk/${store.slug}`;
    if (navigator.share) {
      navigator.share({ title: store.name, text: `Check out ${store.name} on Tap2Buy!`, url });
    }
  }

  function getPaymentStatusBadge(order: Order) {
    if (order.paymentMethod === "cod") {
      return {
        label: "💵 COD",
        className: "bg-orange-100 text-orange-700",
      };
    }

    if (order.paymentStatus === "paid") {
      return {
        label: "🟢 Paid",
        className: "bg-green-100 text-green-700",
      };
    }

    if (order.paymentStatus === "failed") {
      return {
        label: "🔴 Rejected",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: "🟡 Pending Payment",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  // Fullscreen slip viewer
  if (viewingSlip && selected?.paymentSlipUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between p-4 bg-black/50">
          <span className="text-white font-medium">Payment Slip</span>
          <button
            onClick={() => setViewingSlip(false)}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <img
            src={selected.paymentSlipUrl}
            alt="Payment slip"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  // Rejection modal
  if (rejectingPayment && selected) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-5">
          <h3 className="text-lg font-bold mb-4">Reject Payment</h3>
          <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
          <select
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select reason</option>
            <option value="Incorrect amount">Incorrect amount</option>
            <option value="Invalid slip">Invalid slip</option>
            <option value="Payment not received">Payment not received</option>
            <option value="Wrong bank account">Wrong bank account</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRejectingPayment(false);
                setRejectionReason("");
              }}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => rejectPayment(selected.id, rejectionReason || "Payment verification failed")}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Order detail overlay
  if (selected) {
    const action = ACTION_BUTTONS[selected.orderStatus];
    const paymentBadge = getPaymentStatusBadge(selected);

    // Determine what to show based on payment status
    const needsPaymentVerification =
      selected.paymentMethod === "online" &&
      selected.paymentStatus !== "paid" &&
      selected.paymentSlipUrl;

    const canProcessOrder =
      selected.paymentMethod === "cod" ||
      selected.paymentStatus === "paid";

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-sm text-gray-600 py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BG[selected.orderStatus] || "bg-gray-100 text-gray-600"}`}>
              {selected.orderStatus}
            </span>
          </div>
        </div>

        <div className="p-4 pb-32 max-w-lg mx-auto space-y-4 animate-fade-up">
          {/* Order header */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{selected.orderNumber}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(selected.createdAt)}</p>
          </div>

          {/* Customer info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Customer</p>
            <p className="font-semibold text-gray-900">{selected.buyerName}</p>
            <div className="flex items-center gap-2 mt-2">
              <a
                href={`tel:${selected.buyerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border rounded-xl text-sm font-medium text-gray-700 active:bg-gray-100"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
              <a
                href={`https://wa.me/${selected.buyerPhone.replace(/^0/, "94").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selected.buyerName}, regarding your order ${selected.orderNumber}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-sm text-gray-700 break-words">{selected.buyerAddress}</p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2.5">Items</p>
            <div className="space-y-2.5">
              {selected.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    LKR {(Number(item.productPrice) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t space-y-1">
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>LKR {Number(selected.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Payment Details</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">{selected.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold">LKR {Number(selected.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${paymentBadge.className}`}>
                  {paymentBadge.label}
                </span>
              </div>
            </div>

            {/* View Slip Button */}
            {selected.paymentMethod === "online" && selected.paymentSlipUrl && (
              <button
                onClick={() => setViewingSlip(true)}
                className="w-full mt-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <Eye className="w-4 h-4" />
                View Slip
              </button>
            )}

            {/* Payment Slip Note */}
            {selected.paymentSlipNote && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Customer Note:</span> {selected.paymentSlipNote}
              </p>
            )}

            {/* Rejection Reason */}
            {selected.rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-600">{selected.rejectionReason}</p>
              </div>
            )}

            {/* Waiting for payment slip */}
            {selected.paymentMethod === "online" && !selected.paymentSlipUrl && selected.paymentStatus !== "paid" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-sm text-gray-600">⏳ Waiting for customer to upload payment slip...</p>
              </div>
            )}
          </div>

          {/* PAYMENT VERIFICATION SECTION */}
          {needsPaymentVerification && (
            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 animate-pulse-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-amber-900">⚠️ Payment Verification Required</h3>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                Review the payment slip and confirm the payment before processing this order.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => confirmPayment(selected.id)}
                  className="flex-1 py-3.5 bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm Payment
                </button>
                <button
                  onClick={() => setRejectingPayment(true)}
                  className="flex-1 py-3.5 bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Payment Confirmed Banner */}
          {selected.paymentMethod === "online" && selected.paymentStatus === "paid" && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-700">✓ Payment Verified - Ready to process order</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick action buttons — fixed at bottom */}
        {/* Only show order actions if payment is verified (or COD) */}
        {canProcessOrder && (
          <>
            {(action ||
              (selected.paymentMethod === "cod" && selected.paymentStatus !== "paid" && selected.orderStatus === "delivered") ||
              selected.orderStatus === "pending") && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-2 animate-slide-up">
                {action && (
                  <button
                    onClick={() => updateStatus(selected.id, action.next)}
                    className={`w-full py-3.5 text-white rounded-2xl text-sm font-semibold active:scale-[0.98] transition-all shadow-sm ${action.color}`}
                  >
                    {action.label}
                  </button>
                )}
                {selected.paymentMethod === "cod" &&
                  selected.paymentStatus !== "paid" &&
                  selected.orderStatus === "delivered" && (
                    <button
                      onClick={() => markCodCollected(selected.id)}
                      className="w-full py-3.5 bg-green-600 text-white rounded-2xl text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all"
                    >
                      COD Payment Collected
                    </button>
                  )}
                {selected.orderStatus === "pending" && canProcessOrder && (
                  <button
                    onClick={() => updateStatus(selected.id, "cancelled")}
                    className="w-full py-3 border border-red-200 text-red-600 rounded-2xl text-sm font-medium active:scale-[0.98] transition-all"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900 mb-4">Orders</h1>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
              filter === s
                ? "bg-indigo-600 text-white font-medium"
                : "bg-white border border-gray-200 text-gray-600 active:bg-gray-100"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Order list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm mb-3">
            {filter === "all"
              ? "Your first order is waiting to happen."
              : `No ${filter} orders found.`}
          </p>
          {filter === "all" && (
            <button
              onClick={shareStore}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              Share your store
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const firstImage = order.items?.[0]?.product?.images?.[0];
            return (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 text-left active:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {firstImage ? (
                      <img src={firstImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {order.buyerName}
                      </p>
                      <p className="font-semibold text-sm text-gray-900 ml-2 whitespace-nowrap">
                        LKR {Number(order.total).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[order.orderStatus] || "bg-gray-400"}`} />
                        <span className="text-xs text-gray-500">{order.orderStatus}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getPaymentStatusBadge(order).className}`}>
                          {getPaymentStatusBadge(order).label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
