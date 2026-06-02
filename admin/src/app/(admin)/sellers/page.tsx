"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { DataTable, Pagination } from "@/components/data-table";
import { Badge } from "@/components/badge";

interface SellerRow {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
  store: { id: string; name: string; slug: string; subscriptionTier: string } | null;
  wallet: { balance: any } | null;
}

export default function SellersPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchSellers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.set("search", search);

      const data = await api.get<{ sellers: SellerRow[]; pagination: any }>(
        `/api/admin/sellers?${params}`,
        { token }
      );
      setSellers(data.sellers);
      setPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: SellerRow) => (
        <span className="font-medium text-white">{row.name || "—"}</span>
      ),
    },
    { key: "phone", label: "Phone" },
    {
      key: "store",
      label: "Store",
      render: (row: SellerRow) => row.store ? (
        <span className="text-indigo-300">{row.store.name}</span>
      ) : (
        <span className="text-slate-500">No store</span>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      render: (row: SellerRow) => row.store ? (
        <Badge variant={row.store.subscriptionTier}>{row.store.subscriptionTier}</Badge>
      ) : "—",
    },
    {
      key: "wallet",
      label: "Wallet",
      render: (row: SellerRow) => row.wallet
        ? formatCurrency(Number(row.wallet.balance))
        : "—",
    },
    { key: "createdAt", label: "Joined", render: (row: SellerRow) => formatDate(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Sellers" description="All registered sellers" />

      <div className="max-w-sm">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or phone..."
        />
      </div>

      <DataTable
        columns={columns}
        data={sellers}
        loading={loading}
        emptyMessage="No sellers found"
        onRowClick={(row) => router.push(`/sellers/${row.id}`)}
      />
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}
