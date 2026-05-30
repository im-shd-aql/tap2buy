"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { TrendingUp, Eye, ShoppingBag, DollarSign, Package, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductAnalytics {
  id: string;
  name: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  image: string | null;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [hasRevenueAnalytics, setHasRevenueAnalytics] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && store) {
      api
        .get<{ analytics: ProductAnalytics[]; hasRevenueAnalytics?: boolean }>(
          `/api/stores/${store.id}/analytics`,
          { token }
        )
        .then((data) => {
          setAnalytics(data.analytics);
          setHasRevenueAnalytics(data.hasRevenueAnalytics ?? true);
        })
        .catch((err) => {
          console.error("Failed to load analytics:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, store]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalViews = analytics.reduce((sum, p) => sum + p.views, 0);
  const totalSales = analytics.reduce((sum, p) => sum + p.sales, 0);
  const totalRevenue = analytics.reduce((sum, p) => sum + p.revenue, 0);
  const avgConversion =
    analytics.length > 0
      ? analytics.reduce((sum, p) => sum + p.conversionRate, 0) / analytics.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Analytics</h1>
        <p className="text-gray-500 mt-1">Track views, sales, and performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
          <div className={`flex items-center justify-between ${!hasRevenueAnalytics ? "opacity-30 blur-[2px]" : ""}`}>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold mt-1">{hasRevenueAnalytics ? totalSales : "---"}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          {!hasRevenueAnalytics && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
          <div className={`flex items-center justify-between ${!hasRevenueAnalytics ? "opacity-30 blur-[2px]" : ""}`}>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                {hasRevenueAnalytics ? `LKR ${totalRevenue.toLocaleString()}` : "---"}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          {!hasRevenueAnalytics && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
          <div className={`flex items-center justify-between ${!hasRevenueAnalytics ? "opacity-30 blur-[2px]" : ""}`}>
            <div>
              <p className="text-sm text-gray-500">Avg Conversion</p>
              <p className="text-2xl font-bold mt-1">{hasRevenueAnalytics ? `${avgConversion.toFixed(1)}%` : "---"}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          {!hasRevenueAnalytics && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Upgrade prompt for Starter */}
      {!hasRevenueAnalytics && (
        <Link
          href="/dashboard/subscription"
          className="block bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center"
        >
          <Lock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-indigo-800">
            Sales, revenue, and conversion data require the Pro plan
          </p>
          <p className="text-xs text-indigo-600 mt-1">Tap to upgrade</p>
        </Link>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-bold text-base">Product Performance</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Sorted by revenue (highest first)
          </p>
        </div>

        {analytics.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No analytics data yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Analytics will appear once you have products with views or sales
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {product.views.toLocaleString()}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right ${!hasRevenueAnalytics ? "opacity-30 blur-[2px] select-none" : ""}`}>
                      <span className="text-sm font-medium text-gray-700">
                        {hasRevenueAnalytics ? product.sales : "---"}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right ${!hasRevenueAnalytics ? "opacity-30 blur-[2px] select-none" : ""}`}>
                      <span className="text-sm font-semibold text-gray-900">
                        {hasRevenueAnalytics ? `LKR ${product.revenue.toLocaleString()}` : "---"}
                      </span>
                    </td>
                    <td className={`px-5 py-4 text-right ${!hasRevenueAnalytics ? "opacity-30 blur-[2px] select-none" : ""}`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          !hasRevenueAnalytics
                            ? "bg-gray-100 text-gray-400"
                            : product.conversionRate >= 5
                              ? "bg-emerald-100 text-emerald-700"
                              : product.conversionRate >= 2
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {hasRevenueAnalytics ? `${product.conversionRate.toFixed(1)}%` : "---"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
