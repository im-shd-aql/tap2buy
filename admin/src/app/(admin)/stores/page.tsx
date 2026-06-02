"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { DataTable, Pagination } from "@/components/data-table";
import { Badge } from "@/components/badge";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  subscriptionTier: string;
  isActive: boolean;
  createdAt: string;
  seller: { id: string; phone: string; name: string | null };
  _count: { products: number; orders: number };
}

export default function StoresPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [active, setActive] = useState("");

  const fetchStores = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.set("search", search);
      if (tier) params.set("tier", tier);
      if (active) params.set("active", active);

      const data = await api.get<{ stores: StoreRow[]; pagination: any }>(
        `/api/admin/stores?${params}`,
        { token }
      );
      setStores(data.stores);
      setPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, tier, active]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const columns = [
    {
      key: "name",
      label: "Store",
      render: (row: StoreRow) => (
        <div>
          <p className="font-medium text-white">{row.name}</p>
          <p className="text-xs text-slate-500">/{row.slug}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", render: (row: StoreRow) => row.category || "—" },
    {
      key: "subscriptionTier",
      label: "Tier",
      render: (row: StoreRow) => <Badge variant={row.subscriptionTier}>{row.subscriptionTier}</Badge>,
    },
    { key: "products", label: "Products", render: (row: StoreRow) => row._count.products },
    { key: "orders", label: "Orders", render: (row: StoreRow) => row._count.orders },
    {
      key: "isActive",
      label: "Status",
      render: (row: StoreRow) => (
        <Badge variant={row.isActive ? "active" : "inactive"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Created", render: (row: StoreRow) => formatDate(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Stores" description="Manage all stores on the platform" />

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search stores..."
          />
        </div>
        <select
          value={tier}
          onChange={(e) => { setTier(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Tiers</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select
          value={active}
          onChange={(e) => { setActive(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        emptyMessage="No stores found"
        onRowClick={(row) => router.push(`/stores/${row.id}`)}
      />
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}
