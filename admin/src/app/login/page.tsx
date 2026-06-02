"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth";
import { Shield, Phone, KeyRound, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { user, loading, sendOtp, verifyOtp, error: authError } = useAdminAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await sendOtp(phone, "recaptcha-container");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      await verifyOtp(otp);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-600/20 rounded-xl mx-auto mb-6">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>

          <h1 className="text-xl font-semibold text-center text-white mb-1">Super Admin</h1>
          <p className="text-sm text-slate-400 text-center mb-8">Tap2Buy Platform Control</p>

          {(error || authError) && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error || authError}</p>
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
              <label className="text-sm text-slate-300 mb-2 block">Phone Number</label>
              <div className="relative mb-6">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending || phone.length < 10}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                {sending ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <label className="text-sm text-slate-300 mb-2 block">Verification Code</label>
              <div className="relative mb-6">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 tracking-widest text-center text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={verifying || otp.length < 6}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                {verifying ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-white transition"
              >
                Use different number
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-slate-600 text-center mt-6">
          Restricted access — authorized personnel only
        </p>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
