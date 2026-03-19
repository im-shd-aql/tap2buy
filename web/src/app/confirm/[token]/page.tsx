"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Truck,
  Clock,
  MapPin,
} from "lucide-react";

interface OrderItem {
  productName: string;
  productPrice: string;
  quantity: number;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: string;
  serviceFee: string;
  total: string;
  items: OrderItem[];
  store: { name: string; slug: string; themeColor: string };
  createdAt: string;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

export default function ConfirmDeliveryPage() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ order: TrackedOrder }>(`/api/orders/track/${token}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    setError("");
    try {
      await api.post("/api/orders/confirm-by-token", { token });
      setConfirmed(true);
      if (order) setOrder({ ...order, orderStatus: "delivered" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-500 text-sm">{error || "This link is invalid or expired."}</p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const themeColor = order.store.themeColor;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Order Tracking</p>
          <h1 className="text-xl font-bold mt-1">{order.orderNumber}</h1>
          <Link
            href={`/${order.store.slug}`}
            className="text-sm font-medium hover:underline"
            style={{ color: themeColor }}
          >
            {order.store.name}
          </Link>
        </div>

        {/* Status tracker */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center mb-6">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-medium text-red-700">Order Cancelled</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8" />
              <div
                className="absolute top-5 left-0 h-0.5 mx-8 transition-all duration-500"
                style={{
                  backgroundColor: themeColor,
                  width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`,
                }}
              />

              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isComplete = i <= currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isComplete ? "text-white" : "bg-gray-100 text-gray-400"
                      }`}
                      style={isComplete ? { backgroundColor: themeColor } : {}}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs mt-1.5 text-center ${
                        isComplete ? "font-medium" : "text-gray-400"
                      }`}
                      style={isComplete ? { color: themeColor } : {}}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery confirmation banner */}
        {confirmed ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-700">Delivery Confirmed!</p>
            <p className="text-sm text-green-600 mt-1">Thank you for confirming.</p>
          </div>
        ) : (
          order.orderStatus === "shipped" && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-700 font-medium mb-3">
                Have you received your order?
              </p>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {confirming ? "Confirming..." : "Yes, I Received My Order"}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )
        )}

        {/* Order details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-0.5">
                <span>
                  {item.productName} x{item.quantity}
                </span>
                <span>LKR {(Number(item.productPrice) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>LKR {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Service fee</span>
              <span>LKR {Number(order.serviceFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-1">
              <span>Total</span>
              <span>LKR {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-gray-400">Payment</span>
            <span>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ordered</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <Link
            href={`/${order.store.slug}`}
            className="text-sm font-medium hover:underline"
            style={{ color: themeColor }}
          >
            Continue Shopping at {order.store.name}
          </Link>
        </div>

        <footer className="text-center py-6 text-xs text-gray-400">
          Powered by{" "}
          <a href="https://tap2buy.lk" className="underline">
            Tap2Buy
          </a>
        </footer>
      </div>
    </div>
  );
}
