"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { StatCard } from "@/components/stat-card";
import { Package, ShoppingBag, DollarSign, Wallet, ArrowLeft } from "lucide-react";

interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  subscriptionTier: string;
  isActive: boolean;
  logoUrl: string | null;
  monthlyOrderCount: number;
  createdAt: string;
  seller: { id: string; phone: string; name: string | null; email: string | null; createdAt: string; wallet: { balance: any } | null };
  products: any[];
  orders: any[];
  _count: { products: number; orders: number };
}

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const router = useRouter();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierLoading, setTierLoading] = useState(false);

  useEffect(() => {
    if (token && id) {
      api.get<{ store: StoreDetail }>(`/api/admin/stores/${id}`, { token })
        .then((d) => setStore(d.store))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, id]);

  const toggleActive = async () => {
    if (!store || !token) return;
    const updated = await api.put<{ store: StoreDetail }>(
      `/api/admin/stores/${id}`,
      { isActive: !store.isActive },
      { token }
    );
    setStore({ ...store, isActive: updated.store.isActive });
  };

  const changeTier = async (newTier: string) => {
    if (!store || !token) return;
    setTierLoading(true);
    try {
      const updated = await api.put<{ store: any }>(
        `/api/admin/stores/${id}`,
        { subscriptionTier: newTier },
        { token }
      );
      setStore({ ...store, subscriptionTier: updated.store.subscriptionTier });
    } finally {
      setTierLoading(false);
    }
  };

  if (loading || !store) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to stores
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-indigo-600/20 flex items-center justify-center text-xl font-bold text-indigo-300">
              {store.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{store.name}</h1>
            <p className="text-sm text-slate-400">/{store.slug} — {store.category || "No category"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={store.subscriptionTier}>{store.subscriptionTier}</Badge>
          <button
            onClick={toggleActive}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              store.isActive
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            }`}
          >
            {store.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400">Change tier:</label>
        <select
          value={store.subscriptionTier}
          onChange={(e) => changeTier(e.target.value)}
          disabled={tierLoading}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <a
          href={`https://tap2buy.lk/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
        >
          Visit Store
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Products" value={store._count.products} icon={Package} iconColor="text-blue-400" />
        <StatCard label="Total Orders" value={store._count.orders} icon={ShoppingBag} iconColor="text-purple-400" />
        <StatCard label="Monthly Orders" value={store.monthlyOrderCount} icon={ShoppingBag} iconColor="text-amber-400" />
        <StatCard
          label="Wallet Balance"
          value={Number(store.seller.wallet?.balance || 0)}
          prefix="LKR "
          decimals={2}
          icon={Wallet}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Seller info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Seller Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Name</p>
            <p className="text-white">{store.seller.name || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Phone</p>
            <p className="text-white">{store.seller.phone}</p>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="text-white">{formatDate(store.seller.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Orders</h3>
        {store.orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {store.orders.slice(0, 10).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{order.buyerName} — {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300">{formatCurrency(Number(order.total))}</span>
                  <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
