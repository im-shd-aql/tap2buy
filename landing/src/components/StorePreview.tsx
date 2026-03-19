"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/hooks/useLang";
import PhoneFrame from "./PhoneFrame";
import StoreHome from "./StoreMockup/StoreHome";
import ProductDetail from "./StoreMockup/ProductDetail";
import Checkout from "./StoreMockup/Checkout";
import OrderConfirm from "./StoreMockup/OrderConfirm";

const slides = [StoreHome, ProductDetail, Checkout, OrderConfirm];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

export default function StorePreview() {
  const { t } = useLang();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrent((prev) => {
        const next = prev + newDirection;
        if (next < 0) return slides.length - 1;
        if (next >= slides.length) return 0;
        return next;
      });
    },
    []
  );

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => paginate(1), 4000);
    return () => clearInterval(interval);
  }, [paginate]);

  const CurrentSlide = slides[current];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section id="store-preview" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-dark sm:text-4xl"
          >
            {t("preview.title")}
            <span className="mx-auto mt-2 block h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary" />
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-muted"
          >
            {t("preview.subtitle")}
          </motion.p>
        </div>

        {/* Phone with carousel */}
        <div className="flex flex-col items-center">
          <PhoneFrame className="relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute inset-0"
              >
                <CurrentSlide />
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>

          {/* Dots */}
          <div className="mt-6 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === current
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-warm-200 hover:bg-warm-100"
                }`}
              />
            ))}
          </div>

          {/* Swipe hint on mobile */}
          <p className="mt-3 text-xs text-muted sm:hidden">
            {t("preview.swipeHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
