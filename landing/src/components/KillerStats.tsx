"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "@/hooks/useLang";

/* ── Count-up animation ────────────────────────────────── */
function CountUp({
  target,
  duration = 1500,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ── Mini animated bar chart ───────────────────────────── */
function MiniBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const bars = [35, 55, 40, 70, 50, 85, 60, 100, 70, 90, 75, 95];

  return (
    <div ref={ref} className="flex items-end gap-[3px] h-20 sm:h-24">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-[3px]"
          style={{
            height: `${h}%`,
            background:
              "linear-gradient(to top, var(--color-primary), var(--color-accent))",
            transformOrigin: "bottom",
          }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{
            delay: 0.15 + i * 0.04,
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated color palette ────────────────────────────── */
function ColorPalette() {
  const swatches = [
    "#E1306C",
    "#F77737",
    "#833AB4",
    "#22C55E",
    "#3B82F6",
    "#EC4899",
    "#8B5CF6",
    "#F59E0B",
    "#14B8A6",
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {swatches.map((color, i) => (
        <motion.div
          key={color}
          className="aspect-square rounded-xl shadow-sm"
          style={{ background: color }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.15 + i * 0.04,
            type: "spring",
            stiffness: 400,
            damping: 20,
          }}
          whileHover={{ scale: 1.2, rotate: 5, transition: { duration: 0.15 } }}
        />
      ))}
    </div>
  );
}

/* ── Bento card wrapper ────────────────────────────────── */
function BentoCard({
  children,
  className = "",
  index,
  gradient,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-3xl border border-white/70 p-6 sm:p-7 ${className}`}
      style={{
        background: gradient,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.5) inset",
      }}
    >
      {/* Hover shine sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 48%, rgba(255,255,255,0.15) 52%, transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ── Icon badges (SVG, not emoji) ──────────────────────── */
function IconBadge({
  children,
  bg,
}: {
  children: React.ReactNode;
  bg: string;
}) {
  return (
    <div
      className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

/* ── Section ───────────────────────────────────────────── */
export default function KillerStats() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/[0.04] to-transparent blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-accent/[0.04] to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="text-3xl font-extrabold text-dark sm:text-4xl lg:text-5xl">
            {t("stats.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            {t("stats.subtitle")}
          </p>
        </motion.div>

        {/* ── Bento grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {/* Card 1 — 60s Setup */}
          <BentoCard
            index={0}
            gradient="linear-gradient(145deg, #FFF5F7 0%, #FFF0F3 100%)"
          >
            <IconBadge bg="rgba(225,48,108,0.1)">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </IconBadge>
            <div className="text-4xl font-black tracking-tight text-dark sm:text-5xl">
              <CountUp target={60} />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                s
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-dark">
              {t("stats.setup")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t("stats.setupDesc")}
            </p>
          </BentoCard>

          {/* Card 2 — LKR 0 Free */}
          <BentoCard
            index={1}
            gradient="linear-gradient(145deg, #F0FDF4 0%, #ECFDF5 100%)"
          >
            <IconBadge bg="rgba(34,197,94,0.1)">
              <svg
                className="h-5 w-5 text-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </IconBadge>
            <div className="text-4xl font-black tracking-tight text-dark sm:text-5xl">
              <span className="text-xl font-bold text-muted sm:text-2xl">
                LKR{" "}
              </span>
              <span className="text-green">0</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-dark">
              {t("stats.cost")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t("stats.costDesc")}
            </p>
          </BentoCard>

          {/* Card 3 — 1-2 Day Settlement */}
          <BentoCard
            index={2}
            gradient="linear-gradient(145deg, #FFF7ED 0%, #FFF4E6 100%)"
          >
            <IconBadge bg="rgba(247,119,55,0.1)">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </IconBadge>
            <div className="text-4xl font-black tracking-tight text-dark sm:text-5xl">
              1-2
              <span className="ml-1 bg-gradient-to-r from-secondary to-primary bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                {t("stats.days")}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-dark">
              {t("stats.settlement")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t("stats.settlementDesc")}
            </p>
          </BentoCard>

          {/* Card 4 — Unlimited Products */}
          <BentoCard
            index={3}
            gradient="linear-gradient(145deg, #FAF5FF 0%, #F3EAFF 100%)"
          >
            <IconBadge bg="rgba(131,58,180,0.1)">
              <svg
                className="h-5 w-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </IconBadge>
            <motion.div
              className="text-5xl font-black text-accent sm:text-6xl"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              &infin;
            </motion.div>
            <p className="mt-2 text-sm font-semibold text-dark">
              {t("stats.products")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t("stats.productsDesc")}
            </p>
          </BentoCard>

          {/* Card 5 — Analytics Dashboard (wide) */}
          <BentoCard
            index={4}
            className="sm:col-span-2"
            gradient="linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="min-w-0 flex-1">
                <IconBadge bg="rgba(225,48,108,0.08)">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </IconBadge>
                <h3 className="text-lg font-bold text-dark sm:text-xl">
                  {t("stats.analytics")}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                  {t("stats.analyticsDesc")}
                </p>
              </div>
              <div className="w-full flex-shrink-0 sm:w-44">
                <MiniBarChart />
              </div>
            </div>
          </BentoCard>

          {/* Card 6 — Customize Your Brand (wide) */}
          <BentoCard
            index={5}
            className="sm:col-span-2"
            gradient="linear-gradient(145deg, #FDF4FF 0%, #FAF0FF 100%)"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="min-w-0 flex-1">
                <IconBadge bg="rgba(131,58,180,0.08)">
                  <svg
                    className="h-5 w-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                    />
                  </svg>
                </IconBadge>
                <h3 className="text-lg font-bold text-dark sm:text-xl">
                  {t("stats.brand")}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                  {t("stats.brandDesc")}
                </p>
              </div>
              <div className="w-full flex-shrink-0 sm:w-32">
                <ColorPalette />
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
