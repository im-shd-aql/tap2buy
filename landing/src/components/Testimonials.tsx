"use client";

import { motion } from "framer-motion";
import { useLang } from "@/hooks/useLang";

export default function Testimonials() {
  const { t } = useLang();

  const testimonials = [
    {
      quote: t("testimonials.quote1"),
      name: t("testimonials.name1"),
      handle: t("testimonials.handle1"),
      category: t("testimonials.category1"),
      gradient: "from-orange-200 to-amber-100",
    },
    {
      quote: t("testimonials.quote2"),
      name: t("testimonials.name2"),
      handle: t("testimonials.handle2"),
      category: t("testimonials.category2"),
      gradient: "from-blue-200 to-cyan-100",
    },
    {
      quote: t("testimonials.quote3"),
      name: t("testimonials.name3"),
      handle: t("testimonials.handle3"),
      category: t("testimonials.category3"),
      gradient: "from-pink-200 to-rose-100",
    },
    {
      quote: t("testimonials.quote4"),
      name: t("testimonials.name4"),
      handle: t("testimonials.handle4"),
      category: t("testimonials.category4"),
      gradient: "from-green-200 to-emerald-100",
    },
  ];

  return (
    <section className="bg-warm-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-dark sm:text-4xl"
          >
            {t("testimonials.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-muted"
          >
            {t("testimonials.subtitle")}
          </motion.p>
        </div>

        {/* Scrollable cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] snap-center rounded-2xl bg-white p-6 shadow-sm sm:min-w-0"
            >
              {/* Quote */}
              <div className="mb-4 text-3xl text-primary/30">&ldquo;</div>
              <p className="mb-6 text-sm leading-relaxed text-dark">
                {item.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${item.gradient}`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.handle} &middot; {item.category}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
