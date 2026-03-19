"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function DashboardNav() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const { store } = useStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!token || !store) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/orders/store/${store.id}?status=pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPendingCount(data.orders?.length || 0))
      .catch(() => {});
  }, [token, store]);

  const links: { href: string; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, badge: pendingCount },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-sm truncate max-w-[200px]">
            {store?.name || "Tap2Buy"}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[75vw] max-w-[280px] bg-white border-r transform transition-transform lg:translate-x-0 lg:static lg:w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b hidden lg:block">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold truncate">{store?.name || "Tap2Buy"}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{user?.phone}</p>
        </div>

        <nav className="p-3 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
                {link.badge && link.badge > 0 ? (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {store && (
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="block text-xs text-indigo-600 mb-3 hover:underline"
            >
              View Store →
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
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
      <div className="min-h-screen flex items-center justify-center">
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
        <div className="min-h-screen flex flex-col lg:flex-row">
          <DashboardNav />
          <main className="flex-1 p-4 lg:p-8 overflow-auto pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </StoreProvider>
    </DashboardGuard>
  );
}
