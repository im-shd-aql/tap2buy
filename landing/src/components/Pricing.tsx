"use client";

import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";

export default function Pricing() {
  const { t } = useLang();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const plans = [
    {
      name: t("pricing.free"),
      price: t("pricing.freePrice"),
      period: t("pricing.freePeriod"),
      desc: t("pricing.freeDesc"),
      fee: t("pricing.freeFee"),
      features: [
        t("pricing.freeFeature1"),
        t("pricing.freeFeature2"),
        t("pricing.freeFeature3"),
        t("pricing.freeFeature4"),
        t("pricing.freeFeature5"),
        t("pricing.freeFeature6"),
        t("pricing.freeFeature7"),
        t("pricing.freeFeature8"),
        t("pricing.freeFeature9"),
        t("pricing.freeFeature10"),
        t("pricing.freeFeature11"),
      ],
      cta: t("pricing.freeCta"),
      popular: false,
    },
    {
      name: t("pricing.pro"),
      price: t("pricing.proPrice"),
      period: t("pricing.proPeriod"),
      desc: t("pricing.proDesc"),
      fee: t("pricing.proFee"),
      features: [
        t("pricing.proFeature1"),
        t("pricing.proFeature2"),
        t("pricing.proFeature3"),
        t("pricing.proFeature4"),
        t("pricing.proFeature5"),
        t("pricing.proFeature6"),
        t("pricing.proFeature7"),
        t("pricing.proFeature8"),
        t("pricing.proFeature9"),
        t("pricing.proFeature10"),
        t("pricing.proFeature11"),
        t("pricing.proFeature12"),
        t("pricing.proFeature13"),
        t("pricing.proFeature14"),
        t("pricing.proFeature15"),
        t("pricing.proFeature16"),
        t("pricing.proFeature17"),
        t("pricing.proFeature18"),
        t("pricing.proFeature19"),
      ],
      cta: t("pricing.proCta"),
      popular: true,
    },
    {
      name: t("pricing.business"),
      price: t("pricing.businessPrice"),
      period: t("pricing.businessPeriod"),
      desc: t("pricing.businessDesc"),
      fee: t("pricing.businessFee"),
      features: [
        t("pricing.businessFeature1"),
        t("pricing.businessFeature2"),
        t("pricing.businessFeature3"),
        t("pricing.businessFeature4"),
        t("pricing.businessFeature5"),
        t("pricing.businessFeature6"),
        t("pricing.businessFeature7"),
        t("pricing.businessFeature8"),
        t("pricing.businessFeature9"),
        t("pricing.businessFeature10"),
        t("pricing.businessFeature11"),
        t("pricing.businessFeature12"),
        t("pricing.businessFeature13"),
        t("pricing.businessFeature14"),
        t("pricing.businessFeature15"),
        t("pricing.businessFeature16"),
        t("pricing.businessFeature17"),
        t("pricing.businessFeature18"),
        t("pricing.businessFeature19"),
        t("pricing.businessFeature20"),
      ],
      cta: t("pricing.businessCta"),
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-dark sm:text-4xl"
          >
            {t("pricing.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-muted"
          >
            {t("pricing.subtitle")}
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "border-2 border-primary bg-white shadow-xl shadow-primary/10"
                  : "border border-warm-100 bg-white shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                  {t("pricing.popular")}
                </span>
              )}

              <h3 className="text-lg font-bold text-dark">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-dark">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </div>

              <p className="mt-2 text-sm font-medium text-primary">{plan.fee}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.slice(0, expandedPlan === i ? undefined : 5).map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-dark">
                    <svg className="h-4 w-4 flex-shrink-0 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.features.length > 5 && (
                <button
                  onClick={() => setExpandedPlan(expandedPlan === i ? null : i)}
                  className="mt-4 text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {expandedPlan === i ? (
                    <>
                      {t("pricing.seeLess")}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      {t("pricing.seeAll")} ({plan.features.length - 5} more)
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}

              <a
                href={process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001/onboarding"}
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-dark"
                    : "border-2 border-warm-200 text-dark hover:border-primary hover:text-primary"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
