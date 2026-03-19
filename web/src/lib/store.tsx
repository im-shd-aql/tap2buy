"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { api } from "./api";

interface Store {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  logoUrl: string | null;
  themeColor: string;
  bannerUrl: string | null;
  announcement: string | null;
  socialLinks: { instagram?: string; facebook?: string; whatsapp?: string; tiktok?: string } | null;
  aboutText: string | null;
  deliveryInfo: string | null;
  returnPolicy: string | null;
  whatsappNumber: string | null;
  fontStyle: string | null;
  isActive: boolean;
}

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  refreshStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStore = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ store: Store }>("/api/stores/me/store", { token });
      setStore(data.store);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshStore();
    else setLoading(false);
  }, [user, token]);

  return (
    <StoreContext.Provider value={{ store, loading, refreshStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
