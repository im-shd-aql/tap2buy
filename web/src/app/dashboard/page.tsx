"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
  Copy,
  Check,
  Share2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Crown,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { useSubscription, getUsagePercent, getUsageColor } from "@/lib/subscription";

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
  productCount: number;
  hasLogo: boolean;
  hasBankAccount: boolean;
  hasDeliveryInfo: boolean;
  hasSharedStore: boolean;
  weekOrdersChange: number;
  topProduct: { name: string; salesCount: number } | null;
  actionItems: { type: string; count: number; label: string }[];
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
  const { data: subData } = useSubscription();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [copied, setCopied] = useState(false);

  // Usage warnings
  const productPercent = subData?.usage.products.limit
    ? getUsagePercent(subData.usage.products)
    : 0;
  const orderPercent = subData?.usage.orders.limit
    ? getUsagePercent(subData.usage.orders)
    : 0;
  const showUsageWarning = productPercent >= 80 || orderPercent >= 80;

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

  // Greeting logic
  function getGreeting() {
    if (!stats) return "";
    if (stats.totalOrders === 0) {
      return "Your store is live! Share it to get your first order.";
    }
    if (stats.todayOrders > 0) {
      return `You received ${stats.todayOrders} order${stats.todayOrders > 1 ? "s" : ""} today.`;
    }
    return "Welcome back. Your customers are waiting.";
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Progress checklist
  const checklist = stats
    ? [
        { label: "Add products", done: stats.productCount > 0, href: "/dashboard/products/new" },
        { label: "Setup payments", done: stats.hasBankAccount, href: "/dashboard/wallet" },
        { label: "Add store logo", done: stats.hasLogo, href: "/dashboard/store" },
        { label: "Set delivery info", done: stats.hasDeliveryInfo, href: "/dashboard/store" },
        { label: "Share your store", done: stats.hasSharedStore, href: undefined },
        { label: "Receive first order", done: stats.totalOrders > 0, href: undefined },
      ]
    : [];

  const allChecklistDone = checklist.every((c) => c.done);
  const checklistProgress = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-4">
      {/* Section 1 — Dynamic Greeting */}
      <div className="pt-1">
        <p className="text-xs text-gray-400 font-medium">{today}</p>
        <h1 className="text-lg font-bold text-gray-900 mt-0.5">
          {getGreeting()}
        </h1>
      </div>

      {/* Section 2 — Revenue Snapshot Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Today
          </div>
          <p className="text-base font-bold text-gray-900 truncate">
            {formatLKR(stats?.revenue.today || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            This Month
          </div>
          <p className="text-base font-bold text-gray-900 truncate">
            {formatLKR(stats?.revenue.month || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            Total Orders
          </div>
          <p className="text-base font-bold text-gray-900">{stats?.totalOrders || 0}</p>
        </div>
        <div className={`rounded-2xl p-3.5 border shadow-sm ${
          (stats?.pendingOrders || 0) > 0
            ? "bg-amber-50 border-amber-200"
            : "bg-white border-gray-100"
        }`}>
          <div className={`flex items-center gap-1.5 text-xs mb-1.5 ${
            (stats?.pendingOrders || 0) > 0 ? "text-amber-600" : "text-gray-400"
          }`}>
            <Clock className="w-3.5 h-3.5" />
            Pending
          </div>
          <p className={`text-base font-bold ${
            (stats?.pendingOrders || 0) > 0 ? "text-amber-700" : "text-gray-900"
          }`}>
            {stats?.pendingOrders || 0}
          </p>
        </div>
      </div>

      {/* Section 3 — Action Required */}
      {stats && stats.actionItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Action Required</span>
          </div>
          <div className="space-y-2">
            {stats.actionItems.map((item) => (
              <Link
                key={item.type}
                href={`/dashboard/orders?filter=${item.type}`}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-100 active:bg-amber-50 transition-colors"
              >
                <span className="text-sm text-amber-900">{item.label}</span>
                <ArrowRight className="w-4 h-4 text-amber-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Plan & Usage — always visible */}
      {subData && (
        <Link
          href="/dashboard/subscription"
          className={`block rounded-2xl p-4 border transition-colors active:opacity-90 ${
            productPercent >= 100 || orderPercent >= 100
              ? "bg-red-50 border-red-200"
              : productPercent >= 80 || orderPercent >= 80
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-gray-100 shadow-sm"
          }`}
        >
          {/* Plan header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                subData.subscription.tier === "starter"
                  ? "bg-gray-100" : subData.subscription.tier === "pro"
                    ? "bg-indigo-100" : "bg-amber-100"
              }`}>
                <Crown className={`w-3.5 h-3.5 ${
                  subData.subscription.tier === "starter"
                    ? "text-gray-500" : subData.subscription.tier === "pro"
                      ? "text-indigo-600" : "text-amber-600"
                }`} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">{subData.subscription.label} Plan</span>
                <span className="text-[10px] text-gray-400 ml-1.5">
                  {subData.subscription.tier === "starter" ? "Free" : `Rs ${subData.tiers.find(t => t.isCurrent)?.price.toLocaleString()}/mo`}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Usage bars */}
          <div className="grid grid-cols-2 gap-3">
            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Products
                </span>
                <span className="text-[11px] font-semibold text-gray-700">
                  {subData.usage.products.limit !== null
                    ? `${subData.usage.products.current}/${subData.usage.products.limit}`
                    : `${subData.usage.products.current}`}
                </span>
              </div>
              {subData.usage.products.limit !== null ? (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      productPercent >= 100 ? "bg-red-500" : productPercent >= 80 ? "bg-amber-500" : productPercent >= 50 ? "bg-amber-400" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(productPercent, 100)}%` }}
                  />
                </div>
              ) : (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-400 w-1/6" />
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-0.5">
                {subData.usage.products.limit === null
                  ? "Unlimited"
                  : productPercent >= 100
                    ? "Limit reached"
                    : `${subData.usage.products.limit - subData.usage.products.current} left`}
              </p>
            </div>

            {/* Orders */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  Orders/mo
                </span>
                <span className="text-[11px] font-semibold text-gray-700">
                  {subData.usage.orders.limit !== null
                    ? `${subData.usage.orders.current}/${subData.usage.orders.limit}`
                    : `${subData.usage.orders.current}`}
                </span>
              </div>
              {subData.usage.orders.limit !== null ? (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      orderPercent >= 100 ? "bg-red-500" : orderPercent >= 80 ? "bg-amber-500" : orderPercent >= 50 ? "bg-amber-400" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(orderPercent, 100)}%` }}
                  />
                </div>
              ) : (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-400 w-1/6" />
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-0.5">
                {subData.usage.orders.limit === null
                  ? "Unlimited"
                  : orderPercent >= 100
                    ? "Limit reached"
                    : `${subData.usage.orders.limit - subData.usage.orders.current} left`}
              </p>
            </div>
          </div>

          {/* Upgrade nudge for Starter */}
          {subData.subscription.tier === "starter" && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-indigo-600 font-medium">Upgrade for more products & orders</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          )}
        </Link>
      )}

      {/* Section 4 — Recent Orders Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-900">Recent Orders</h2>
          {(stats?.totalOrders || 0) > 0 && (
            <Link href="/dashboard/orders" className="text-indigo-600 text-xs font-medium">
              View All
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">
              Your first order is waiting to happen.
            </p>
            <button
              onClick={shareNative}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              Share your store
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders?id=${order.id}`}
                className="flex items-center justify-between p-3.5 active:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900">{order.buyerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                </div>
                <div className="text-right ml-3 flex items-center gap-2.5">
                  <span className="font-semibold text-sm text-gray-900">
                    LKR {Number(order.total).toLocaleString()}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      order.orderStatus === "delivered"
                        ? "bg-green-500"
                        : order.orderStatus === "pending"
                        ? "bg-yellow-400"
                        : order.orderStatus === "cancelled"
                        ? "bg-red-500"
                        : order.orderStatus === "shipped"
                        ? "bg-purple-500"
                        : "bg-blue-500"
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Section 5 — Store Growth */}
      {stats && stats.totalOrders > 0 && (stats.weekOrdersChange !== 0 || stats.topProduct) && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">Growth</span>
          </div>
          <div className="space-y-1">
            {stats.weekOrdersChange !== 0 && (
              <p className="text-sm text-indigo-700">
                {stats.weekOrdersChange > 0 ? "+" : ""}{stats.weekOrdersChange}% orders this week
              </p>
            )}
            {stats.topProduct && (
              <p className="text-sm text-indigo-700">
                Best-selling: {stats.topProduct.name} ({stats.topProduct.salesCount} sold)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section 6 — Progress Checklist */}
      {stats && !allChecklistDone && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900">Getting Started</h2>
            <span className="text-xs text-gray-400 font-medium">
              {checklistProgress}/{checklist.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${(checklistProgress / checklist.length) * 100}%` }}
            />
          </div>
          <div className="space-y-1">
            {checklist.map((item) => {
              const content = (
                <div
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    item.href && !item.done ? "active:bg-gray-50" : ""
                  }`}
                >
                  {item.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    item.done ? "text-gray-400 line-through" : "text-gray-700"
                  }`}>
                    {item.label}
                  </span>
                </div>
              );

              if (item.href && !item.done) {
                return <Link key={item.label} href={item.href}>{content}</Link>;
              }

              if (!item.href && item.label === "Share your store" && !item.done) {
                return (
                  <button key={item.label} onClick={shareNative} className="w-full text-left">
                    {content}
                  </button>
                );
              }

              return <div key={item.label}>{content}</div>;
            })}
          </div>
        </div>
      )}

      {/* Section 7 — Store Link Share Card */}
      {store && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium mb-2">Your Store Link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-sm font-mono truncate flex-1 text-gray-700">
              tap2buy.lk/{store.slug}
            </span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white active:scale-95 transition-transform"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform text-gray-700"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
