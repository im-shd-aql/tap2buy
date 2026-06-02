"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { ArrowLeft } from "lucide-react";

interface SellerDetail {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  store: any | null;
  wallet: { balance: any; totalEarned: any; totalWithdrawn: any; transactions: any[] } | null;
  bankAccounts: any[];
  payouts: any[];
}

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && id) {
      api.get<{ seller: SellerDetail }>(`/api/admin/sellers/${id}`, { token })
        .then((d) => setSeller(d.seller))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, id]);

  if (loading || !seller) {
    return (
      <div className="space-y-4">
        <div className="h-8 skeleton rounded w-48" />
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to sellers
      </button>

      <PageHeader title={seller.name || seller.phone} description={`Seller — ${seller.phone}`} />

      <div className="grid grid-cols-2 gap-6">
        {/* Info card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Personal Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">Phone</p><p className="text-white">{seller.phone}</p></div>
            <div><p className="text-slate-500">Email</p><p className="text-white">{seller.email || "—"}</p></div>
            <div><p className="text-slate-500">Role</p><p className="text-white">{seller.role}</p></div>
            <div><p className="text-slate-500">Joined</p><p className="text-white">{formatDate(seller.createdAt)}</p></div>
          </div>
        </div>

        {/* Store card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Store</h3>
          {seller.store ? (
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{seller.store.name}</span>
                <Badge variant={seller.store.subscriptionTier}>{seller.store.subscriptionTier}</Badge>
              </div>
              <p className="text-slate-400">/{seller.store.slug}</p>
              <button
                onClick={() => router.push(`/stores/${seller.store.id}`)}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                View store details →
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No store created</p>
          )}
        </div>
      </div>

      {/* Wallet */}
      {seller.wallet && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Wallet</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Balance</p>
              <p className="text-white text-lg font-semibold">{formatCurrency(Number(seller.wallet.balance))}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Earned</p>
              <p className="text-white">{formatCurrency(Number(seller.wallet.totalEarned))}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Withdrawn</p>
              <p className="text-white">{formatCurrency(Number(seller.wallet.totalWithdrawn))}</p>
            </div>
          </div>

          {seller.wallet.transactions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs text-slate-400 uppercase mb-2">Recent Transactions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {seller.wallet.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 text-sm">
                    <div>
                      <p className="text-slate-300">{tx.description}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className={tx.type === "credit" ? "text-emerald-400" : "text-red-400"}>
                      {tx.type === "credit" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bank accounts */}
      {seller.bankAccounts.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Bank Accounts</h3>
          {seller.bankAccounts.map((acc: any) => (
            <div key={acc.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-white">{acc.bankName} — {acc.branch}</p>
                <p className="text-slate-500">{acc.accountNumber} ({acc.accountName})</p>
              </div>
              {acc.isPrimary && <Badge variant="active">Primary</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
