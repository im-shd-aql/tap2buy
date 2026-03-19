"use client";

import { useLang } from "@/hooks/useLang";

export default function StoreHome() {
  const { t } = useLang();

  const products = [
    { name: t("store.product1"), price: t("store.price1"), gradient: "from-orange-200 to-amber-100", emoji: "\uD83C\uDF82" },
    { name: t("store.product2"), price: t("store.price2"), gradient: "from-red-200 to-pink-100", emoji: "\uD83E\uDDC1" },
    { name: t("store.product3"), price: t("store.price3"), gradient: "from-amber-200 to-yellow-100", emoji: "\uD83C\uDF6A" },
    { name: t("store.product4"), price: t("store.price4"), gradient: "from-rose-200 to-orange-100", emoji: "\uD83C\uDF81" },
    { name: t("store.product5"), price: t("store.price5"), gradient: "from-yellow-200 to-lime-100", emoji: "\uD83E\uDD50" },
    { name: t("store.product6"), price: t("store.price6"), gradient: "from-pink-200 to-rose-100", emoji: "\uD83E\uDD67" },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Store banner */}
      <div className="relative bg-gradient-to-r from-primary to-secondary px-4 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 text-lg font-bold text-white">
            N
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">{t("store.name")}</h2>
            <p className="text-[10px] text-white/80">{t("store.tagline")}</p>
          </div>
          <button className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {t("store.whatsapp")}
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <h3 className="mb-2 text-xs font-bold text-dark">{t("store.featured")}</h3>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-warm-50 shadow-sm">
              <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${product.gradient}`}>
                <span className="text-2xl">{product.emoji}</span>
              </div>
              <div className="p-2">
                <p className="truncate text-[10px] font-medium text-dark">{product.name}</p>
                <p className="text-xs font-bold text-primary">LKR {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around border-t border-warm-100 px-2 py-2">
        {[
          { label: t("store.navHome"), icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", active: true },
          { label: t("store.navProducts"), icon: "M4 6h16M4 10h16M4 14h16M4 18h16", active: false },
          { label: t("store.navCart"), icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z", active: false },
          { label: t("store.navContact"), icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", active: false },
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-0.5">
            <svg className={`h-4 w-4 ${item.active ? "text-primary" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className={`text-[8px] ${item.active ? "font-medium text-primary" : "text-muted"}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
