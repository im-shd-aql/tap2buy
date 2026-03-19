"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface WalletData {
  id: string;
  balance: string;
  totalEarned: string;
  totalWithdrawn: string;
  isCodEnabled: boolean;
  onlineOrderCount: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  balanceAfter: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export default function WalletPage() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankForm, setBankForm] = useState({
    bankName: "",
    branch: "",
    accountNumber: "",
    accountName: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get<{ wallet: WalletData }>("/api/wallet", { token }),
      api.get<{ transactions: Transaction[] }>("/api/wallet/transactions", { token }),
      api.get<{ accounts: BankAccount[] }>("/api/wallet/bank-accounts", { token }),
    ]).then(([w, t, b]) => {
      setWallet(w.wallet);
      setTransactions(t.transactions);
      setBankAccounts(b.accounts);
    });
  }, [token]);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post(
        "/api/wallet/withdraw",
        { amount: parseFloat(withdrawAmount), bankAccountId: selectedBank },
        { token: token! }
      );
      setShowWithdraw(false);
      setWithdrawAmount("");
      const [w, t] = await Promise.all([
        api.get<{ wallet: WalletData }>("/api/wallet", { token: token! }),
        api.get<{ transactions: Transaction[] }>("/api/wallet/transactions", { token: token! }),
      ]);
      setWallet(w.wallet);
      setTransactions(t.transactions);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { account } = await api.post<{ account: BankAccount }>(
        "/api/wallet/bank-accounts",
        { ...bankForm, isPrimary: bankAccounts.length === 0 },
        { token: token! }
      );
      setBankAccounts((prev) => [...prev, account]);
      setShowAddBank(false);
      setBankForm({ bankName: "", branch: "", accountNumber: "", accountName: "" });
    } catch (err: any) {
      setError(err.message);
    }
  }

  const formatLKR = (amount: string | number) =>
    `LKR ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-5">Wallet</h1>

      {/* Balance cards */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 mb-6">
        <div className="bg-indigo-600 text-white rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm mb-1">
            <Wallet className="w-4 h-4" />
            Available Balance
          </div>
          <p className="text-xl sm:text-2xl font-bold">{formatLKR(wallet?.balance || 0)}</p>
          <button
            onClick={() => setShowWithdraw(true)}
            className="mt-3 px-5 py-2 bg-white text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 active:scale-[0.98] transition-transform"
          >
            Withdraw
          </button>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border">
          <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Total Earned
          </div>
          <p className="text-xl sm:text-2xl font-bold">{formatLKR(wallet?.totalEarned || 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border">
          <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-1">
            <ArrowUpRight className="w-4 h-4" />
            Total Withdrawn
          </div>
          <p className="text-xl sm:text-2xl font-bold">{formatLKR(wallet?.totalWithdrawn || 0)}</p>
        </div>
      </div>

      {/* COD status */}
      {wallet && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <p className="text-sm">
            COD Status:{" "}
            {wallet.isCodEnabled ? (
              <span className="text-green-600 font-medium">Enabled</span>
            ) : (
              <span className="text-gray-400">
                Locked — {wallet.onlineOrderCount}/10 online orders completed
              </span>
            )}
          </p>
        </div>
      )}

      {/* Withdraw modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm sm:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Withdraw Funds</h2>
            {bankAccounts.length === 0 ? (
              <div>
                <p className="text-gray-500 text-sm mb-4">
                  Add a bank account first to withdraw funds.
                </p>
                <button
                  onClick={() => {
                    setShowWithdraw(false);
                    setShowAddBank(true);
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium"
                >
                  Add Bank Account
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="w-full py-3 text-gray-500 text-sm mt-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Amount (LKR)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="500"
                    className="w-full px-4 py-3 border rounded-xl text-base"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum: LKR 500</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Bank Account</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl text-base"
                    required
                  >
                    <option value="">Select account</option>
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="w-full py-3 text-gray-500 text-sm"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add bank modal */}
      {showAddBank && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm sm:mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Bank Account</h2>
            <form onSubmit={handleAddBank} className="space-y-3">
              <input
                placeholder="Bank Name"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl text-base"
                required
              />
              <input
                placeholder="Branch"
                value={bankForm.branch}
                onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl text-base"
                required
              />
              <input
                placeholder="Account Number"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl text-base"
                required
              />
              <input
                placeholder="Account Holder Name"
                value={bankForm.accountName}
                onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl text-base"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
              >
                Add Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddBank(false)}
                className="w-full py-3 text-gray-500 text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-xl border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm sm:text-base">Transactions</h2>
          {bankAccounts.length === 0 && (
            <button
              onClick={() => setShowAddBank(true)}
              className="text-indigo-600 text-sm font-medium"
            >
              + Add Bank
            </button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="divide-y">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {txn.type === "credit" ? (
                    <ArrowDownRight className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{txn.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-medium ${
                      txn.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}{formatLKR(txn.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
