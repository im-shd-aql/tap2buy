"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Share2,
  ExternalLink,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  revenue: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  total: string;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get<{ stats: DashboardStats; recentOrders: Order[] }>(
        "/api/dashboard/stats",
        { token }
      )
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch(() => {});
  }, [token]);

  const storeUrl = store ? `https://tap2buy.lk/${store.slug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Check out my store on Tap2Buy!\n${storeUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: store?.name,
        text: `Check out ${store?.name} on Tap2Buy!`,
        url: storeUrl,
      });
    } else {
      copyLink();
    }
  }

  const formatLKR = (amount: number) =>
    `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-5">Dashboard</h1>

      {/* Store link share card — always visible at top */}
      {store && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
          <p className="text-xs text-indigo-600 font-medium mb-2">Your Store Link</p>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 border">
            <span className="text-sm font-mono truncate flex-1">
              tap2buy.lk/{store.slug}
            </span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white active:scale-95 transition-transform"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={shareNative}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 border">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-1">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Today
          </div>
          <p className="text-base sm:text-xl font-bold truncate">
            {formatLKR(stats?.revenue.today || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-1">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            This Month
          </div>
          <p className="text-base sm:text-xl font-bold truncate">
            {formatLKR(stats?.revenue.month || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-1">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Total Orders
          </div>
          <p className="text-base sm:text-xl font-bold">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm mb-1">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Pending
          </div>
          <p className="text-base sm:text-xl font-bold">{stats?.pendingOrders || 0}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/dashboard/products/new"
          className="flex-1 sm:flex-none px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium text-center hover:bg-indigo-700 active:scale-[0.98] transition-transform"
        >
          + Add Product
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm sm:text-base">Recent Orders</h2>
          {(stats?.totalOrders || 0) > 0 && (
            <Link href="/dashboard/orders" className="text-indigo-600 text-sm font-medium">
              View All
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No orders yet. Share your store link to start getting orders!
          </div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders?id=${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{order.buyerName}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-medium text-sm">
                    LKR {Number(order.total).toLocaleString()}
                  </p>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
