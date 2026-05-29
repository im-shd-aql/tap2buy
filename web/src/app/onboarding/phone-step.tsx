"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface PhoneStepProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  onAuthenticated: (token: string, userId: string) => void;
}

export default function PhoneStep({
  name,
  setName,
  phone,
  setPhone,
  onAuthenticated,
}: PhoneStepProps) {
  const { sendFirebaseOtp, confirmationResult, checkPhone } = useAuth();
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Sanitize phone: strip non-digits, handle +94 prefix
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("94") && cleanPhone.length === 11) {
      cleanPhone = "0" + cleanPhone.slice(2);
    }
    if (!/^0\d{9}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit phone number starting with 0");
      return;
    }
    setPhone(cleanPhone);

    setLoading(true);
    try {
      const phoneCheck = await checkPhone(cleanPhone);
      if (phoneCheck.exists) {
        setError("Account already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

      await sendFirebaseOtp(cleanPhone, "recaptcha-container");
      setPhase("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result. Please request OTP first.");
      }

      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();

      // Register user (create user + wallet, no store)
      const response = await api.post<{ user: { id: string }; token: string }>(
        "/api/auth/register",
        { idToken, name }
      );

      // Store token
      localStorage.setItem("token", response.token);
      document.cookie = `tap2buy_token=${response.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      onAuthenticated(response.token, response.user.id);
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (phase === "otp") {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-1">Enter verification code</h2>
        <p className="text-gray-500 mb-6 text-sm">
          We sent a 6-digit code to {phone}
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.3em] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => {
              setPhase("phone");
              setCode("");
              setError("");
            }}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
          >
            Change phone number
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">Let&apos;s get started</h2>
      <p className="text-gray-500 mb-6 text-sm">
        We&apos;ll send you a verification code
      </p>

      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0771234567"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div id="recaptcha-container"></div>

        <button
          type="submit"
          disabled={loading || !name.trim() || !phone.trim()}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
