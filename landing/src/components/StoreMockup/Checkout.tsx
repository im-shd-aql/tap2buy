"use client";

import { useState } from "react";
import { useLang } from "@/hooks/useLang";

export default function Checkout() {
  const { t } = useLang();
  const [selectedPayment, setSelectedPayment] = useState(0);

  const paymentMethods = [
    { label: t("checkout.card"), icon: "💳" },
    { label: t("checkout.frimi"), icon: "📱" },
    { label: t("checkout.ezcash"), icon: "📲" },
    { label: t("checkout.bank"), icon: "🏦" },
  ];

  return (
    <div className="flex h-full flex-col bg-warm-50">
      {/* Header */}
      <div className="flex items-center gap-2 bg-white px-4 py-2">
        <svg className="h-4 w-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-bold text-dark">{t("checkout.title")}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Order summary */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold text-dark">{t("checkout.orderSummary")}</h3>
          <div className="flex items-center gap-2 rounded-lg bg-warm-50 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-200 to-amber-100">
              <span className="text-lg">🎂</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-dark">{t("checkout.item")}</p>
              <p className="text-[9px] text-muted">{t("checkout.qty")}</p>
            </div>
            <p className="text-[10px] font-bold text-dark">LKR {t("checkout.subtotalAmount")}</p>
          </div>

          <div className="mt-2 space-y-1 border-t border-warm-100 pt-2">
            <div className="flex justify-between text-[9px]">
              <span className="text-muted">{t("checkout.subtotal")}</span>
              <span className="text-dark">LKR {t("checkout.subtotalAmount")}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-muted">{t("checkout.fee")}</span>
              <span className="text-dark">LKR {t("checkout.feeAmount")}</span>
            </div>
            <div className="flex justify-between border-t border-warm-100 pt-1 text-[10px] font-bold">
              <span className="text-dark">{t("checkout.total")}</span>
              <span className="text-primary">LKR {t("checkout.totalAmount")}</span>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[8px] text-green">{t("checkout.feeNote")}</p>
        </div>

        {/* Payment method */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold text-dark">{t("checkout.paymentMethod")}</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {paymentMethods.map((method, i) => (
              <button
                key={i}
                onClick={() => setSelectedPayment(i)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[9px] font-medium transition-all ${
                  selectedPayment === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-warm-200 text-muted"
                }`}
              >
                <span>{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[8px] text-muted">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t("checkout.poweredBy")}
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold text-dark">{t("checkout.delivery")}</h3>
          <div className="space-y-1.5">
            <div className="rounded-lg border border-warm-200 px-2.5 py-2 text-[9px] text-muted">
              {t("checkout.namePlaceholder")}
            </div>
            <div className="rounded-lg border border-warm-200 px-2.5 py-2 text-[9px] text-muted">
              {t("checkout.phonePlaceholder")}
            </div>
            <div className="rounded-lg border border-warm-200 px-2.5 py-2 text-[9px] text-muted">
              {t("checkout.addressPlaceholder")}
            </div>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <div className="border-t border-warm-100 bg-white px-3 py-3">
        <button className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/25">
          {t("checkout.payButton")}
        </button>
      </div>
    </div>
  );
}
