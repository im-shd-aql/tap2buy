"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Upload, Copy, Check, Building2, Hash, User, MapPin } from "lucide-react";
import Link from "next/link";

interface BankDetails {
  bankAccount: {
    bankName: string;
    branch: string;
    accountNumber: string;
    accountName: string;
  };
  amount: string;
  orderNumber: string;
}

export default function BankTransferPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.store as string;
  const orderId = searchParams.get("orderId");
  const fileRef = useRef<HTMLInputElement>(null);

  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [slipUrl, setSlipUrl] = useState("");
  const [slipNote, setSlipNote] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const val = getComputedStyle(document.documentElement).getPropertyValue("--store-theme")?.trim();
    if (val) setThemeColor(val);
  }, []);

  useEffect(() => {
    if (orderId) {
      api
        .get<BankDetails>(`/api/orders/${orderId}/bank-details`)
        .then((data) => setBankDetails(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const { url } = await api.upload(file);
      setSlipUrl(url);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !slipUrl) return;

    setLoading(true);
    setError("");

    try {
      await api.post(`/api/orders/${orderId}/payment-slip`, {
        paymentSlipUrl: slipUrl,
        paymentSlipNote: slipNote || undefined,
      });

      // Redirect to success page
      router.push(`/${storeSlug}/checkout?orderId=${orderId}&orderNumber=${bankDetails?.orderNumber}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !bankDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !bankDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-gray-500 text-sm">{error}</p>
          <Link
            href={`/${storeSlug}`}
            className="inline-block mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!bankDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>

        {/* Bank Details Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold">Bank Account Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Bank Name</p>
                <p className="font-semibold">{bankDetails.bankAccount.bankName}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.bankAccount.bankName, "bank")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied === "bank" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Branch</p>
                <p className="font-semibold">{bankDetails.bankAccount.branch}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.bankAccount.branch, "branch")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied === "branch" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Account Number</p>
                <p className="font-bold text-lg">{bankDetails.bankAccount.accountNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.bankAccount.accountNumber, "account")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied === "account" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Account Name</p>
                <p className="font-semibold">{bankDetails.bankAccount.accountName}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.bankAccount.accountName, "name")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied === "name" ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount to Transfer</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    LKR {Number(bankDetails.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.amount, "amount")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copied === "amount" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700">
              💡 Transfer the exact amount via your bank app, ATM, or cash deposit. Then upload the payment slip below.
            </p>
          </div>
        </div>

        {/* Upload Payment Slip Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold mb-4">Upload Payment Slip</h2>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!slipUrl ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors flex flex-col items-center gap-3"
              >
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload payment slip
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Screenshot or bank receipt photo (max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </button>
            ) : (
              <div className="relative">
                <img
                  src={slipUrl}
                  alt="Payment slip"
                  className="w-full rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlipUrl("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                value={slipNote}
                onChange={(e) => setSlipNote(e.target.value)}
                placeholder="e.g. Transferred from Sampath Bank"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!slipUrl || loading}
            className="w-full py-4 text-white rounded-2xl font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-all duration-200 shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            {loading ? "Submitting..." : "Submit Payment Slip"}
          </button>

          <p className="text-xs text-center text-gray-500">
            Your order will be confirmed once the seller verifies your payment
          </p>
        </form>
      </div>
    </div>
  );
}
