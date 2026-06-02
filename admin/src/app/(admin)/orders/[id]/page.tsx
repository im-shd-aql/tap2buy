"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: any;
  serviceFee: any;
  total: any;
  bookingFee: any;
  paymentSlipUrl: string | null;
  notes: string | null;
  createdAt: string;
  store: { id: string; name: string; slug: string; seller: { id: string; name: string | null; phone: string } };
  items: { id: string; productName: string; productPrice: any; quantity: number; product: { images: string[] } }[];
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (token && id) {
      api.get<{ order: OrderDetail }>(`/api/admin/orders/${id}`, { token })
        .then((d) => setOrder(d.order))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, id]);

  const updateStatus = async (newStatus: string) => {
    if (!token || !order) return;
    setUpdating(true);
    try {
      const updated = await api.put<{ order: OrderDetail }>(
        `/api/admin/orders/${id}/status`,
        { orderStatus: newStatus },
        { token }
      );
      setOrder({ ...order, orderStatus: updated.order.orderStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="space-y-4">
        <div className="h-8 skeleton rounded w-48" />
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
          <p className="text-sm text-slate-400">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={order.paymentMethod}>{order.paymentMethod.toUpperCase()}</Badge>
          <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
          <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
        </div>
      </div>

      {/* Status timeline */}
      {order.orderStatus !== "cancelled" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Order Progress</h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition",
                    isCompleted ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500",
                    isCurrent && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn("text-sm capitalize", isCompleted ? "text-white" : "text-slate-500")}>{step}</span>
                  {i < statusSteps.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-2", i < currentStep ? "bg-indigo-600" : "bg-white/10")} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Override buttons */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <span className="text-sm text-slate-400 mr-2">Override status:</span>
            {statusSteps.map((step) => (
              <button
                key={step}
                onClick={() => updateStatus(step)}
                disabled={updating || step === order.orderStatus}
                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed capitalize transition"
              >
                {step}
              </button>
            ))}
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={updating || order.orderStatus === "cancelled"}
              className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/20 rounded-md text-red-300 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Order items */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                {item.product.images?.[0] && (
                  <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">{item.productName}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm text-slate-300">{formatCurrency(Number(item.productPrice) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service Fee</span>
              <span>{formatCurrency(Number(order.serviceFee))}</span>
            </div>
            {order.bookingFee && (
              <div className="flex justify-between text-slate-400">
                <span>Booking Fee</span>
                <span>{formatCurrency(Number(order.bookingFee))}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Buyer */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Buyer</h3>
            <div className="text-sm space-y-1">
              <p className="text-white">{order.buyerName}</p>
              <p className="text-slate-400">{order.buyerPhone}</p>
              <p className="text-slate-400 text-xs mt-2">{order.buyerAddress}</p>
            </div>
          </div>

          {/* Store */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Store & Seller</h3>
            <div className="text-sm space-y-1">
              <p className="text-white">{order.store.name}</p>
              <p className="text-slate-400">/{order.store.slug}</p>
              <p className="text-slate-400 mt-2">Seller: {order.store.seller.name || order.store.seller.phone}</p>
            </div>
          </div>

          {/* Payment slip */}
          {order.paymentSlipUrl && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Payment Slip</h3>
              <img src={order.paymentSlipUrl} alt="Payment slip" className="rounded-lg w-full" />
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Notes</h3>
              <p className="text-sm text-slate-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
