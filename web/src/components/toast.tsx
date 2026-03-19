"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  cartLink?: string;
  leaving?: boolean;
}

interface ToastContextType {
  toast: (message: string, cartLink?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, cartLink?: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev.filter((t) => !t.leaving), { id, message, cartLink }]);

    // Start leave animation after 2.5s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      );
    }, 2500);

    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm w-full bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 ${
              t.leaving ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span className="flex-1 text-sm font-medium truncate">{t.message}</span>
            {t.cartLink && (
              <Link
                href={t.cartLink}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
              >
                View Cart
              </Link>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="p-0.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
