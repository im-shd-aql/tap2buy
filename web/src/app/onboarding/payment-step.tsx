"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Check, ChevronDown, ChevronUp, Banknote } from "lucide-react";

interface PaymentStepProps {
  token: string;
  onNext: () => void;
}

export default function PaymentStep({ token, onNext }: PaymentStepProps) {
  const [showBank, setShowBank] = useState(false);
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(
        "/api/wallet/bank-accounts",
        {
          bankName,
          branch,
          accountNumber,
          accountName,
          isPrimary: true,
        },
        { token }
      );
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">How will you get paid?</h2>
      <p className="text-gray-500 mb-6 text-sm">
        You can always change this later in settings
      </p>

      {/* COD Badge */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-emerald-800 text-sm">Cash on Delivery</p>
          <p className="text-emerald-600 text-xs">Enabled by default</p>
        </div>
      </div>

      {/* Bank transfer section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => !saved && setShowBank(!showBank)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <p className="font-medium text-sm">Bank Transfer</p>
              <p className="text-xs text-gray-500">
                {saved ? "Bank account added" : "Optional — add your bank details"}
              </p>
            </div>
          </div>
          {saved ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : showBank ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showBank && !saved && (
          <form onSubmit={handleSaveBank} className="p-4 pt-0 space-y-3">
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Add Bank Account"}
            </button>
          </form>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  );
}
