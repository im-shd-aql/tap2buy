"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";

export default function PricingCalculator() {
  const { t } = useLang();
  const [price, setPrice] = useState(3000);

  const fee = Math.round(price * 0.06);
  const customerPays = price + fee;
  const sellerReceives = price;

  const competitors = [
    {
      name: t("calculator.daraz"),
      feePercent: "~30%",
      monthly: "LKR 0",
      totalCost: `LKR ${Math.round(price * 0.3).toLocaleString()}`,
      highlight: false,
    },
    {
      name: t("calculator.shoponcloud"),
      feePercent: "0%",
      monthly: "LKR 2,500",
      totalCost: `LKR 2,500`,
      highlight: false,
    },
    {
      name: t("calculator.shopify"),
      feePercent: "2.9%",
      monthly: "~LKR 9,500",
      totalCost: `LKR ${(9500 + Math.round(price * 0.029)).toLocaleString()}`,
      highlight: false,
    },
    {
      name: t("calculator.tap2buy"),
      feePercent: "6%",
      monthly: t("calculator.free"),
      totalCost: `LKR ${fee.toLocaleString()}`,
      highlight: true,
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-dark sm:text-4xl"
          >
            {t("calculator.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-muted"
          >
            {t("calculator.subtitle")}
          </motion.p>
        </div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <label className="mb-2 block text-sm font-semibold text-dark">
            {t("calculator.yourPrice")}
          </label>
          <div className="mb-6 text-center text-4xl font-extrabold text-primary">
            LKR {price.toLocaleString()}
          </div>
          <input
            type="range"
            min={500}
            max={25000}
            step={100}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mb-8 h-2 w-full cursor-pointer appearance-none rounded-full bg-warm-100 accent-primary"
          />

          {/* Results */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: t("calculator.yourPrice"), value: `LKR ${price.toLocaleString()}`, color: "text-dark" },
              { label: t("calculator.customerPays"), value: `LKR ${customerPays.toLocaleString()}`, color: "text-dark" },
              { label: t("calculator.youReceive"), value: `LKR ${sellerReceives.toLocaleString()}`, color: "text-green" },
              { label: t("calculator.ourFee"), value: `LKR ${fee.toLocaleString()}`, color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-warm-50 p-4 text-center">
                <p className="mb-1 text-[10px] font-medium text-muted sm:text-xs">{item.label}</p>
                <p className={`text-base font-extrabold sm:text-lg ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-warm-100"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-50">
                <th className="px-4 py-3 text-left font-semibold text-dark">{t("calculator.platform")}</th>
                <th className="px-4 py-3 text-left font-semibold text-dark">{t("calculator.fee")}</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-dark sm:table-cell">{t("calculator.monthlyCost")}</th>
                <th className="px-4 py-3 text-right font-semibold text-dark">{t("calculator.totalCost")}</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr
                  key={i}
                  className={`border-t border-warm-100 ${
                    c.highlight ? "bg-green/5" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-dark">
                    {c.name}
                    {c.highlight && (
                      <span className="ml-2 inline-block rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-bold text-green">
                        {t("calculator.cheapest")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.feePercent}</td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{c.monthly}</td>
                  <td className={`px-4 py-3 text-right font-bold ${c.highlight ? "text-green" : "text-dark"}`}>
                    {c.totalCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
