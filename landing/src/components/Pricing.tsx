"use client";

import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";

export default function Pricing() {
  const { t } = useLang();

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
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-dark">
                    <svg className="h-4 w-4 flex-shrink-0 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/94XXXXXXXXX?text=Hi!%20I%20want%20to%20sign%20up%20for%20the%20${encodeURIComponent(plan.name)}%20plan`}
                target="_blank"
                rel="noopener noreferrer"
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
