"use client";

import { useState } from "react";
import { useLang } from "@/hooks/useLang";

export default function ProductDetail() {
  const { t } = useLang();
  const [selectedSize, setSelectedSize] = useState(0);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <svg className="h-4 w-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium text-dark">{t("product.back")}</span>
      </div>

      {/* Product image */}
      <div className="aspect-square w-full bg-gradient-to-br from-orange-200 via-amber-100 to-orange-100">
        <div className="flex h-full items-center justify-center">
          <span className="text-6xl">🎂</span>
        </div>
      </div>

      {/* Product info */}
      <div className="flex-1 px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-dark">{t("product.name")}</h2>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="flex text-secondary">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-[10px]">{s}</span>
                ))}
              </div>
              <span className="text-[9px] text-muted">({t("product.reviews")})</span>
            </div>
          </div>
          <p className="text-base font-extrabold text-primary">LKR {t("product.price")}</p>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-muted">
          {t("product.description")}
        </p>

        {/* Size selector */}
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold text-dark">{t("product.size")}</p>
          <div className="flex gap-2">
            {[t("product.size1"), t("product.size2")].map((size, i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`rounded-lg border px-4 py-1.5 text-[10px] font-medium transition-all ${
                  selectedSize === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-warm-200 text-muted"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add to cart */}
      <div className="border-t border-warm-100 px-4 py-3">
        <button className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/25">
          {t("product.addToCart")}
        </button>
      </div>
    </div>
  );
}
