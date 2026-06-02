"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { DataTable, Pagination } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

interface OrderRow {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  total: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  store: { name: string; slug: string };
  items: any[];
}

const statusTabs = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);

      const data = await api.get<{ orders: OrderRow[]; pagination: any }>(
        `/api/admin/orders?${params}`,
        { token }
      );
      setOrders(data.orders);
      setPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      render: (row: OrderRow) => <span className="font-medium text-white">{row.orderNumber}</span>,
    },
    {
      key: "buyer",
      label: "Buyer",
      render: (row: OrderRow) => (
        <div>
          <p className="text-slate-200">{row.buyerName}</p>
          <p className="text-xs text-slate-500">{row.buyerPhone}</p>
        </div>
      ),
    },
    {
      key: "store",
      label: "Store",
      render: (row: OrderRow) => <span className="text-slate-300">{row.store.name}</span>,
    },
    {
      key: "items",
      label: "Items",
      render: (row: OrderRow) => <span className="text-slate-400">{row.items.length} item{row.items.length !== 1 ? "s" : ""}</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (row: OrderRow) => <span className="text-white">{formatCurrency(Number(row.total))}</span>,
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (row: OrderRow) => <Badge variant={row.paymentMethod}>{row.paymentMethod.toUpperCase()}</Badge>,
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (row: OrderRow) => <Badge variant={row.orderStatus}>{row.orderStatus}</Badge>,
    },
    {
      key: "createdAt",
      label: "Time",
      render: (row: OrderRow) => <span className="text-slate-400 text-xs">{timeAgo(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Global order feed across all stores" />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search order #, buyer name or phone..."
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatus(tab); setPage(1); }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md capitalize transition",
              status === tab
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={(row) => router.push(`/orders/${row.id}`)}
      />
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}
