"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { api } from "./api";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, code: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  // Firebase Phone Auth methods
  sendFirebaseOtp: (phone: string, recaptchaContainer: string) => Promise<void>;
  verifyFirebaseOtp: (code: string, name?: string) => Promise<void>;
  confirmationResult: ConfirmationResult | null;
  // Check if phone exists
  checkPhone: (phone: string) => Promise<{ exists: boolean; hasStore: boolean }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setAuthCookie(token: string) {
  document.cookie = `tap2buy_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = "tap2buy_token=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem("token");
      if (!stored) {
        clearAuthCookie();
        setLoading(false);
        return;
      }
      setToken(stored);
      const data = await api.get<{ user: User }>("/api/auth/me", { token: stored });
      setUser(data.user);
      setAuthCookie(stored);
    } catch {
      localStorage.removeItem("token");
      clearAuthCookie();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const sendOtp = async (phone: string) => {
    await api.post("/api/auth/send-otp", { phone });
  };

  const login = async (phone: string, code: string, name?: string) => {
    const data = await api.post<{ user: User; token: string }>(
      "/api/auth/verify-otp",
      { phone, code, name }
    );
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setAuthCookie(data.token);
  };

  const logout = async () => {
    await api.post("/api/auth/logout").catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    clearAuthCookie();
  };

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

    // Reset the global grecaptcha widget if it exists
    try {
      const w = window as any;
      if (w.grecaptcha?.reset) {
        w.grecaptcha.reset();
      }
    } catch {
      // ignore — grecaptcha may not be loaded yet
    }

    // Replace the container DOM node entirely so reCAPTCHA sees a fresh element
    const old = document.getElementById(containerId);
    if (old && old.parentNode) {
      const fresh = document.createElement("div");
      fresh.id = containerId;
      old.parentNode.replaceChild(fresh, old);
    }
  };

  // Firebase Phone Auth: Send OTP
  const sendFirebaseOtp = async (phone: string, recaptchaContainer: string) => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    // Convert local format (0771234567) to international (+94771234567)
    const internationalPhone = phone.startsWith("0")
      ? "+94" + phone.slice(1)
      : phone;

    try {
      // Fully clean up any previous reCAPTCHA state
      cleanupRecaptcha(recaptchaContainer);

      // Initialize fresh reCAPTCHA
      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: "invisible",
      });
      recaptchaVerifierRef.current = recaptchaVerifier;

      // Send OTP via Firebase
      const result = await signInWithPhoneNumber(
        auth,
        internationalPhone,
        recaptchaVerifier
      );
      setConfirmationResult(result);
    } catch (error: any) {
      console.error("Firebase OTP send failed:", error);
      // Clean up on error so user can retry
      cleanupRecaptcha(recaptchaContainer);
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  // Firebase Phone Auth: Verify OTP
  const verifyFirebaseOtp = async (code: string, name?: string) => {
    if (!confirmationResult) {
      throw new Error("No confirmation result found. Please request OTP first.");
    }

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();

      // Send Firebase ID token to backend
      const data = await api.post<{ user: User; token: string }>(
        "/api/auth/verify-firebase",
        { idToken, name }
      );

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setAuthCookie(data.token);
      setConfirmationResult(null);
    } catch (error: any) {
      console.error("Firebase OTP verification failed:", error);
      throw new Error(error.message || "Invalid OTP code");
    }
  };

  // Check if phone number has an account
  const checkPhone = async (phone: string): Promise<{ exists: boolean; hasStore: boolean }> => {
    return await api.post<{ exists: boolean; hasStore: boolean }>(
      "/api/auth/check-phone",
      { phone }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        sendOtp,
        sendFirebaseOtp,
        verifyFirebaseOtp,
        confirmationResult,
        checkPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
