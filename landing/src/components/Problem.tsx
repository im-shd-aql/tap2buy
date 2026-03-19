"use client";

import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";

export default function Problem() {
  const { t } = useLang();

  const beforeSteps = [
    { text: t("problem.step1"), icon: "💬" },
    { text: t("problem.step2"), icon: "⌨️" },
    { text: t("problem.step3"), icon: "🏦" },
    { text: t("problem.step4"), icon: "⏳" },
    { text: t("problem.step5"), icon: "🔍" },
    { text: t("problem.step6"), icon: "❌" },
  ];

  const afterSteps = [
    { text: t("problem.after1"), icon: "🔗" },
    { text: t("problem.after2"), icon: "🛒" },
    { text: t("problem.after3"), icon: "💳" },
    { text: t("problem.after4"), icon: "✅" },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-extrabold text-dark sm:text-4xl"
        >
          {t("problem.title")}
        </motion.h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-accent/20 bg-red-light p-6 sm:p-8"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-accent">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm">
                😩
              </span>
              {t("problem.before")}
            </h3>
            <div className="space-y-4">
              {beforeSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                    {step.icon}
                  </span>
                  <div className="flex-1 rounded-lg bg-white/60 px-3 py-2">
                    <p className="text-sm text-dark">{step.text}</p>
                  </div>
                  {i < beforeSteps.length - 1 && (
                    <svg className="h-4 w-4 flex-shrink-0 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-green/20 bg-green-light p-6 sm:p-8"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-green">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-sm">
                🎉
              </span>
              {t("problem.after")}
            </h3>
            <div className="space-y-4">
              {afterSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                    {step.icon}
                  </span>
                  <div className="flex-1 rounded-lg bg-white/60 px-3 py-2">
                    <p className="text-sm text-dark">{step.text}</p>
                  </div>
                  {i < afterSteps.length - 1 && (
                    <svg className="h-4 w-4 flex-shrink-0 text-green/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
