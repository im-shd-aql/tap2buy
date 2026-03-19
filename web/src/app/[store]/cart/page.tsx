"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Banknote,
  MapPin,
  User,
  Phone,
  StickyNote,
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const storeSlug = params.store as string;
  const { items, storeId, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serviceFeeRate = paymentMethod === "online" ? 0.06 : 0.08;
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const total = subtotal + serviceFee;

  // Read theme color from CSS variable or default
  const themeColor = typeof document !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue("--store-theme")?.trim() || "#6366f1"
    : "#6366f1";

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setError("");
    setLoading(true);

    try {
      const { order } = await api.post<{ order: { id: string; orderNumber: string } }>(
        "/api/orders",
        {
          storeId,
          buyerName,
          buyerPhone,
          buyerAddress,
          paymentMethod,
          notes: notes || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }
      );

      clearCart();
      router.push(
        `/${storeSlug}/checkout?orderId=${order.id}&orderNumber=${order.orderNumber}${
          paymentMethod === "cod" ? "&cod=true" : ""
        }`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-gray-50">
        <div className="text-center animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6 text-sm">Looks like you haven&apos;t added anything yet</p>
          <Link
            href={`/${storeSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Header */}
        <Link
          href={`/${storeSlug}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 py-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold mb-5">
          Your Cart
          <span className="text-base font-normal text-gray-400 ml-2">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>

        {/* Cart items card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          {items.map((item, idx) => (
            <div
              key={item.productId}
              className={`flex gap-3.5 p-4 ${idx > 0 ? "border-t border-gray-100" : ""}`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  LKR {item.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold ml-auto tabular-nums">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery & payment form */}
        <form onSubmit={handleCheckout} className="space-y-5">
          {/* Delivery Details Card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold">Delivery Details</h2>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Delivery address"
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <StickyNote className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes (optional)"
                  rows={1}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment method card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold">Payment Method</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === "online"
                    ? "border-gray-900 bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="hidden"
                />
                <CreditCard className={`w-5 h-5 mb-2 ${paymentMethod === "online" ? "text-gray-900" : "text-gray-400"}`} />
                <p className="font-semibold text-sm">Pay Online</p>
                <p className="text-xs text-gray-500 mt-0.5">Card / Bank</p>
                <p className="text-xs text-gray-400 mt-1">6% fee</p>
              </label>
              <label
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === "cod"
                    ? "border-gray-900 bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="hidden"
                />
                <Banknote className={`w-5 h-5 mb-2 ${paymentMethod === "cod" ? "text-gray-900" : "text-gray-400"}`} />
                <p className="font-semibold text-sm">Cash on Delivery</p>
                <p className="text-xs text-gray-500 mt-0.5">Pay on arrival</p>
                <p className="text-xs text-gray-400 mt-1">8% fee</p>
              </label>
            </div>
          </div>

          {/* Order Summary card */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium tabular-nums">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Service fee ({Math.round(serviceFeeRate * 100)}%)
                </span>
                <span className="font-medium tabular-nums">LKR {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="tabular-nums">LKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-gray-800 disabled:opacity-50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Place Order — LKR ${total.toLocaleString()}`
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure checkout powered by Tap2Buy
          </div>
        </form>
      </div>
    </div>
  );
}
