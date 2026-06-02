"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { Store, ShoppingBag, DollarSign, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  totalSellers: number;
  tierBreakdown: { tier: string; count: number }[];
  recentOrders: any[];
  dailyOrders: { date: string; count: number }[];
  dailyRevenue: { date: string; revenue: number }[];
  topStores: { id: string; name: string; revenue: number }[];
}

const TIER_COLORS: Record<string, string> = {
  starter: "#64748b",
  pro: "#6366f1",
  business: "#f59e0b",
};

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get<Stats>("/api/admin/stats", { token })
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Platform overview" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 skeleton rounded-xl" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Platform overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 stagger-children">
        <StatCard
          label="Total Stores"
          value={stats.totalStores}
          icon={Store}
          iconColor="text-blue-400"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          iconColor="text-purple-400"
        />
        <StatCard
          label="Total Revenue"
          value={Number(stats.totalRevenue)}
          prefix="LKR "
          decimals={2}
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
        <StatCard
          label="Active Sellers"
          value={stats.totalSellers}
          icon={Users}
          iconColor="text-amber-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Orders (30 days)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyOrders}>
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).getDate().toString()}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#a5b4fc" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fill="url(#orderGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue (30 days)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyRevenue}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).getDate().toString()}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#a5b4fc" }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tier breakdown */}
        <ChartCard title="Subscription Tiers">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tierBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="tier"
                >
                  {stats.tierBreakdown.map((entry) => (
                    <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] || "#6366f1"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {stats.tierBreakdown.map((t) => (
              <div key={t.tier} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[t.tier] }} />
                {t.tier} ({t.count})
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent orders */}
        <ChartCard title="Recent Orders">
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-200">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{order.store?.name} - {timeAgo(order.createdAt)}</p>
                </div>
                <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </ChartCard>

        {/* Top stores */}
        <ChartCard title="Top Stores by Revenue">
          <div className="space-y-3">
            {stats.topStores.map((store, i) => (
              <div key={store.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{i + 1}.</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{store.name}</span>
                </div>
                <span className="text-slate-400 text-xs">{formatCurrency(store.revenue)}</span>
              </div>
            ))}
            {stats.topStores.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No data yet</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
