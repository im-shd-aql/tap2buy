"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Store,
} from "lucide-react";

function BottomTabNav() {
  const pathname = usePathname();
  const { store } = useStore();
  const { token } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!token || !store) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/orders/store/${store.id}?status=pending`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPendingCount(data.orders?.length || 0))
      .catch(() => {});
  }, [token, store]);

  const tabs = [
    { href: "/dashboard", label: "Home", icon: Home, exact: true },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, badge: pendingCount },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/store", label: "Store", icon: Store },
  ];

  function isActive(tab: { href: string; exact?: boolean }) {
    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + "/");
  }

  return (
    <>
      {/* Top header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {store?.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <span className="font-semibold text-sm truncate">
              {store?.name || "Tap2Buy"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors ${
                  active ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <StoreProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <BottomTabNav />
          <main className="flex-1 px-4 py-4 pb-24 max-w-2xl mx-auto w-full">
            {children}
          </main>
        </div>
      </StoreProvider>
    </DashboardGuard>
  );
}
