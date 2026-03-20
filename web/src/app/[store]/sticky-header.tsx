"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function StickyHeader({
  storeName,
  storeSlug,
  logoUrl,
  themeColor,
}: {
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  themeColor: string;
}) {
  const [visible, setVisible] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 200);
        ticking = false;
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      >
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link href={`/${storeSlug}`} className="flex items-center gap-2.5 min-w-0">
            {logoUrl && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-bold text-sm truncate">{storeName}</span>
          </Link>
          {itemCount > 0 && (
            <Link
              href={`/${storeSlug}/cart`}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="tabular-nums">{itemCount}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
