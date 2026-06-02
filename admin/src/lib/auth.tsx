"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { api } from "./api";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

const ADMIN_PHONE = "0766489119";

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
}

interface AdminAuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  sendOtp: (phone: string, recaptchaContainer: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

function setAdminCookie(token: string) {
  document.cookie = `tap2buy_admin_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearAdminCookie() {
  document.cookie = "tap2buy_admin_token=; path=/; max-age=0";
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      // Dev mode: auto-login without OTP
      const isDev = process.env.NODE_ENV === "development";
      let stored = localStorage.getItem("admin_token");

      if (!stored && isDev) {
        const devData = await api.post<{ user: User; token: string }>("/api/admin/dev-login");
        stored = devData.token;
        localStorage.setItem("admin_token", stored);
        setAdminCookie(stored);
        setUser(devData.user);
        setToken(stored);
        setLoading(false);
        return;
      }

      if (!stored) {
        clearAdminCookie();
        setLoading(false);
        return;
      }
      setToken(stored);
      const data = await api.get<{ user: User }>("/api/auth/me", { token: stored });
      if (data.user.role !== "superadmin") {
        throw new Error("Not a super admin");
      }
      setUser(data.user);
      setAdminCookie(stored);
    } catch {
      localStorage.removeItem("admin_token");
      clearAdminCookie();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fully destroy reCAPTCHA verifier and replace DOM container
  const cleanupRecaptcha = (containerId: string) => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } catch {
      recaptchaVerifierRef.current = null;
    }

    try {
      const w = window as any;
      if (w.grecaptcha?.reset) {
        w.grecaptcha.reset();
      }
    } catch {
      // ignore
    }

    const old = document.getElementById(containerId);
    if (old && old.parentNode) {
      const fresh = document.createElement("div");
      fresh.id = containerId;
      old.parentNode.replaceChild(fresh, old);
    }
  };

  const sendOtp = async (phone: string, recaptchaContainer: string) => {
    setError(null);

    if (phone !== ADMIN_PHONE) {
      setError("Access denied. This phone number is not authorized.");
      return;
    }

    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    const internationalPhone = "+94" + phone.slice(1);

    try {
      cleanupRecaptcha(recaptchaContainer);

      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: "invisible",
      });
      recaptchaVerifierRef.current = recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, internationalPhone, recaptchaVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      cleanupRecaptcha(recaptchaContainer);
      throw new Error(err.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) {
      throw new Error("No confirmation result. Please request OTP first.");
    }

    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();

      const data = await api.post<{ user: User; token: string }>(
        "/api/auth/verify-firebase",
        { idToken }
      );

      if (data.user.role !== "superadmin") {
        setError("Access denied. You do not have super admin privileges.");
        return;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("admin_token", data.token);
      setAdminCookie(data.token);
      setConfirmationResult(null);
    } catch (err: any) {
      throw new Error(err.message || "Invalid OTP code");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("admin_token");
    clearAdminCookie();
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, logout, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
