"use client";

import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";

export default function Comparison() {
  const { t } = useLang();

  const comparisons = [
    {
      feature: t("comparison.cost"),
      traditional: t("comparison.costTraditional"),
      tap2buy: t("comparison.costTap2buy"),
      traditionalBad: true,
    },
    {
      feature: t("comparison.setup"),
      traditional: t("comparison.setupTraditional"),
      tap2buy: t("comparison.setupTap2buy"),
      traditionalBad: true,
    },
    {
      feature: t("comparison.payment"),
      traditional: t("comparison.paymentTraditional"),
      tap2buy: t("comparison.paymentTap2buy"),
      traditionalBad: true,
    },
    {
      feature: t("comparison.mobile"),
      traditional: t("comparison.mobileTraditional"),
      tap2buy: t("comparison.mobileTap2buy"),
      traditionalBad: true,
    },
    {
      feature: t("comparison.orders"),
      traditional: t("comparison.ordersTraditional"),
      tap2buy: t("comparison.ordersTap2buy"),
      traditionalBad: true,
    },
    {
      feature: t("comparison.support"),
      traditional: t("comparison.supportTraditional"),
      tap2buy: t("comparison.supportTap2buy"),
      traditionalBad: true,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-warm-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-dark sm:text-4xl"
          >
            {t("comparison.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted"
          >
            {t("comparison.subtitle")}
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-xl"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-warm-100 to-warm-50 p-4 sm:p-6">
            <div></div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted mb-1">{t("comparison.oldWay")}</div>
              <div className="text-base sm:text-lg font-bold text-dark">{t("comparison.traditional")}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-primary mb-1">{t("comparison.newWay")}</div>
              <div className="text-base sm:text-lg font-bold text-primary">Tap2Buy</div>
              <div className="mt-2 inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                {t("comparison.recommended")}
              </div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-warm-100">
            {comparisons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-3 gap-4 p-4 sm:p-6 hover:bg-warm-50 transition-colors"
              >
                {/* Feature Name */}
                <div className="flex items-center">
                  <span className="text-sm sm:text-base font-semibold text-dark">
                    {item.feature}
                  </span>
                </div>

                {/* Traditional */}
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-muted text-center">
                    {item.traditional}
                  </span>
                </div>

                {/* Tap2Buy */}
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-dark text-center">
                    {item.tap2buy}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-center">
            <p className="text-white font-bold text-lg mb-3">
              {t("comparison.cta")}
            </p>
            <a
              href={`https://wa.me/94XXXXXXXXX?text=${encodeURIComponent(t("comparison.ctaMessage"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
            >
              {t("comparison.ctaButton")}
            </a>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">500+</div>
            <div className="text-sm text-muted">{t("comparison.stat1")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">10,000+</div>
            <div className="text-sm text-muted">{t("comparison.stat2")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">60 sec</div>
            <div className="text-sm text-muted">{t("comparison.stat3")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">24/7</div>
            <div className="text-sm text-muted">{t("comparison.stat4")}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
