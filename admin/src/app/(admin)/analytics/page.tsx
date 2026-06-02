"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { cn } from "@/lib/utils";
import { DollarSign, ShoppingBag, TrendingUp, Store } from "lucide-react";
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
  Legend,
} from "recharts";

interface AnalyticsData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newStores: number;
  revenueTrend: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  paymentMethods: { method: string; count: number; total: number }[];
  topStores: { id: string; name: string; revenue: number; orders: number }[];
}

const periods = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  shipped: "#a855f7",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const PAYMENT_COLORS = ["#6366f1", "#f59e0b"];

export default function AnalyticsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    if (token) {
      setLoading(true);
      api.get<AnalyticsData>(`/api/admin/analytics?period=${period}`, { token })
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, period]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Platform performance metrics" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Platform performance metrics"
        actions={
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition",
                  period === p.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 stagger-children">
        <StatCard label="Revenue" value={data.totalRevenue} prefix="LKR " decimals={2} icon={DollarSign} iconColor="text-emerald-400" />
        <StatCard label="Orders" value={data.totalOrders} icon={ShoppingBag} iconColor="text-purple-400" />
        <StatCard label="Avg Order Value" value={data.avgOrderValue} prefix="LKR " decimals={2} icon={TrendingUp} iconColor="text-blue-400" />
        <StatCard label="New Stores" value={data.newStores} icon={Store} iconColor="text-amber-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Revenue Trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => new Date(v).getDate().toString()} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders by Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ordersByStatus} layout="vertical">
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="status" type="category" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Payment Methods">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="method">
                  {data.paymentMethods.map((_, i) => (
                    <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid #312e81", borderRadius: 8 }} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top 10 Stores by Revenue">
          <div className="h-56 overflow-y-auto scrollbar-thin">
            <div className="space-y-2">
              {data.topStores.map((store, i) => {
                const maxRev = data.topStores[0]?.revenue || 1;
                return (
                  <div key={store.id} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500 w-5 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-200 truncate max-w-[160px]">{store.name}</span>
                        <span className="text-slate-400 text-xs">{formatCurrency(store.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(store.revenue / maxRev) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.topStores.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No data for this period</p>
              )}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
