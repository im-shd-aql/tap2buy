"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api } from "./api";

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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, sendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
