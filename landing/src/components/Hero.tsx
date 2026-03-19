"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/hooks/useLang";
import PhoneFrame from "./PhoneFrame";

const platforms = [
  {
    name: "Instagram",
    color: "#E1306C",
    gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
    icon: (
      <svg className="h-7 w-7 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "#1877F2",
    gradient: "from-[#1877F2] via-[#4A9BF5] to-[#1877F2]",
    icon: (
      <svg className="h-7 w-7 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    gradient: "from-[#25D366] via-[#128C7E] to-[#25D366]",
    icon: (
      <svg className="h-7 w-7 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

function PlatformFlipper() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const platform = platforms[index];

  return (
    <span className="relative inline-flex h-[1.2em] items-center overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={platform.name}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="inline-flex items-center gap-2 sm:gap-3"
        >
          <span
            className="inline-flex items-center justify-center rounded-xl p-1 sm:p-1.5"
            style={{ color: platform.color, backgroundColor: `${platform.color}15` }}
          >
            {platform.icon}
          </span>
          <span className={`bg-gradient-to-r ${platform.gradient} bg-clip-text text-transparent`}>
            {platform.name}
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function MiniStorePreview() {
  const { t } = useLang();
  return (
    <div className="flex h-full flex-col bg-white text-[10px]">
      <div className="bg-gradient-to-r from-primary to-secondary px-3 pb-3 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/30" />
          <div>
            <p className="font-bold text-white text-[11px]">{t("store.name")}</p>
            <p className="text-white/80 text-[8px]">{t("store.tagline")}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-2">
        <p className="mb-2 font-semibold text-dark text-[9px]">{t("store.featured")}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { gradient: "from-orange-200 to-amber-100", name: t("store.product1"), price: t("store.price1"), emoji: "🎂" },
            { gradient: "from-red-200 to-pink-100", name: t("store.product2"), price: t("store.price2"), emoji: "🧁" },
            { gradient: "from-amber-200 to-yellow-100", name: t("store.product3"), price: t("store.price3"), emoji: "🍪" },
            { gradient: "from-rose-200 to-orange-100", name: t("store.product4"), price: t("store.price4"), emoji: "🎁" },
          ].map((item, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-warm-50">
              <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                <span className="text-lg">{item.emoji}</span>
              </div>
              <div className="p-1.5">
                <p className="truncate font-medium text-dark text-[8px]">{item.name}</p>
                <p className="font-bold text-primary text-[9px]">LKR {item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-around border-t border-warm-100 px-2 py-1.5">
        {[t("store.navHome"), t("store.navProducts"), t("store.navCart")].map((label) => (
          <span key={label} className="text-muted text-[7px]">{label}</span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pt-16 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:pt-24">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-dark sm:text-5xl lg:text-6xl">
              {t("hero.titlePrefix")}{" "}
              <PlatformFlipper />
              <br />
              <span className="bg-gradient-to-r from-[#833AB4] via-primary to-secondary bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-lg text-lg text-muted lg:mx-0"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <a
              href="https://wa.me/94XXXXXXXXX?text=Hi!%20I%20want%20to%20create%20my%20Tap2Buy%20store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-primary px-8 py-4 text-center text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
            >
              {t("hero.cta")}
            </a>
            <a
              href="#how-it-works"
              className="w-full rounded-full border-2 border-warm-200 px-8 py-4 text-center text-base font-semibold text-dark transition-all hover:border-primary hover:text-primary sm:w-auto"
            >
              {t("hero.ctaSecondary")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-3 lg:justify-start"
          >
            <div className="flex -space-x-2">
              {[
                { initial: "N", bg: "bg-primary" },
                { initial: "K", bg: "bg-secondary" },
                { initial: "A", bg: "bg-accent" },
                { initial: "D", bg: "bg-green" },
                { initial: "S", bg: "bg-primary/70" },
              ].map((avatar, i) => (
                <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-warm-white text-xs font-bold text-white ${avatar.bg}`}>
                  {avatar.initial}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted">{t("hero.socialProof")}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-shrink-0"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <PhoneFrame>
              <MiniStorePreview />
            </PhoneFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
