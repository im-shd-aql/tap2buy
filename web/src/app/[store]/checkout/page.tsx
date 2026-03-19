"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Clock, Copy, Check, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  total: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  confirmationToken: string;
}

function ConfettiDot({ delay, left, color }: { delay: number; left: string; color: string }) {
  return (
    <div
      className="absolute top-0 w-2 h-2 rounded-full animate-confetti"
      style={{
        left,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeSlug = params.store as string;
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const isCod = searchParams.get("cod") === "true";
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Stagger content appearance for dramatic effect
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orderId) {
      api
        .get<{ order: Order }>(`/api/orders/${orderId}`)
        .then((data) => setOrder(data.order))
        .catch(() => {});
    }
  }, [orderId]);

  const trackingUrl = order
    ? `${window.location.origin}/confirm/${order.confirmationToken}`
    : "";

  function copyTrackingLink() {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const confettiColors = ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#3b82f6", "#f43f5e"];

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gray-50">
      <div className="max-w-sm w-full text-center">
        {/* Animated checkmark with confetti */}
        <div className="relative mb-6">
          {/* Confetti dots */}
          {confettiColors.map((color, i) => (
            <ConfettiDot
              key={i}
              delay={0.3 + i * 0.1}
              left={`${15 + i * 13}%`}
              color={color}
            />
          ))}

          {/* Checkmark circle */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center animate-scale-circle shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 12 10 16 18 8" className="animate-checkmark" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-1">
            Your order{" "}
            <span className="font-mono font-bold text-gray-800">{orderNumber}</span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* COD notice */}
        {isCod && (
          <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-5 text-sm text-amber-700 text-left transition-all duration-500 delay-200 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex gap-2.5">
              <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Cash on Delivery</p>
                <p>The seller will contact you to arrange delivery and payment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Order details card */}
        {order && (
          <div className={`bg-white rounded-2xl shadow-sm p-5 mt-5 text-left transition-all duration-500 delay-300 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-lg">
                  LKR {Number(order.total).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold capitalize">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {order && (
          <div className={`mt-5 space-y-2 transition-all duration-500 delay-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link
              href={`/confirm/${order.confirmationToken}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all duration-200 hover:bg-gray-800"
            >
              Track Your Order
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={copyTrackingLink}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link copied!" : "Copy tracking link"}
            </button>
          </div>
        )}

        {/* Continue shopping */}
        <Link
          href={`/${storeSlug}`}
          className={`inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-500 delay-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className={`flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-8 transition-all duration-500 delay-700 ${showContent ? "opacity-100" : "opacity-0"}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          Secured by Tap2Buy
        </div>
      </div>
    </div>
  );
}
