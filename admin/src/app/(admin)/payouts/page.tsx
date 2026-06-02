"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DataTable, Pagination } from "@/components/data-table";
import { Badge } from "@/components/badge";
import { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";

interface PayoutRow {
  id: string;
  amount: any;
  status: string;
  createdAt: string;
  completedAt: string | null;
  seller: { id: string; name: string | null; phone: string };
  bankAccount: { bankName: string; branch: string; accountNumber: string; accountName: string };
}

const statusTabs = ["all", "pending", "processing", "completed", "failed"];

export default function PayoutsPage() {
  const { token } = useAdminAuth();
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayouts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (status !== "all") params.set("status", status);

      const data = await api.get<{ payouts: PayoutRow[]; pagination: any }>(
        `/api/admin/payouts?${params}`,
        { token }
      );
      setPayouts(data.payouts);
      setPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, status]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const updatePayoutStatus = async (payoutId: string, newStatus: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.put(`/api/admin/payouts/${payoutId}/status`, { status: newStatus }, { token });
      setModalOpen(false);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "seller",
      label: "Seller",
      render: (row: PayoutRow) => (
        <div>
          <p className="text-white font-medium">{row.seller.name || "—"}</p>
          <p className="text-xs text-slate-500">{row.seller.phone}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row: PayoutRow) => <span className="text-white font-medium">{formatCurrency(Number(row.amount))}</span>,
    },
    {
      key: "bank",
      label: "Bank",
      render: (row: PayoutRow) => (
        <div>
          <p className="text-slate-300">{row.bankAccount.bankName}</p>
          <p className="text-xs text-slate-500">{row.bankAccount.accountNumber}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: PayoutRow) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    { key: "createdAt", label: "Date", render: (row: PayoutRow) => formatDate(row.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (row: PayoutRow) => (
        row.status === "pending" || row.status === "processing" ? (
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPayout(row); setModalOpen(true); }}
            className="px-3 py-1 text-xs bg-indigo-600/20 text-indigo-300 rounded-md hover:bg-indigo-600/30 transition"
          >
            Manage
          </button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" description="Manage seller payout requests" />

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
        data={payouts}
        loading={loading}
        emptyMessage="No payouts found"
      />
      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* Action modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedPayout(null); }}
        title="Manage Payout"
      >
        {selectedPayout && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Seller</span>
                <span className="text-white">{selectedPayout.seller.name || selectedPayout.seller.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-semibold">{formatCurrency(Number(selectedPayout.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank</span>
                <span className="text-white">{selectedPayout.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account</span>
                <span className="text-white">{selectedPayout.bankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Name</span>
                <span className="text-white">{selectedPayout.bankAccount.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant={selectedPayout.status}>{selectedPayout.status}</Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/10">
              {selectedPayout.status === "pending" && (
                <button
                  onClick={() => updatePayoutStatus(selectedPayout.id, "processing")}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                >
                  Approve
                </button>
              )}
              {(selectedPayout.status === "pending" || selectedPayout.status === "processing") && (
                <button
                  onClick={() => updatePayoutStatus(selectedPayout.id, "completed")}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => updatePayoutStatus(selectedPayout.id, "failed")}
                disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
